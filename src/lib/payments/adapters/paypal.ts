import "server-only";
import type {
  GatewayConfig,
  PayableOrder,
  PaymentAdapter,
  PaymentContext,
  WebhookResult,
} from "../types";

/**
 * PayPal adapter (Orders v2 REST API — redirect flow).
 *
 * PayPal has no first-party Node SDK for the REST API anymore; this is a thin
 * client over `fetch`. The flow is a redirect plus a server-side capture driven
 * by the webhook (like SeQura's two-way handshake, not Stripe's fire-and-forget):
 *
 *   1. createPayment → OAuth2 client-credentials token, then POST /v2/checkout/
 *      orders (intent CAPTURE). PayPal answers with the order id (kept as
 *      `paymentRef`) and an `approve`/`payer-action` link. We redirect the buyer
 *      there. `custom_id` carries our order id so the webhook can resolve it.
 *   2. The buyer approves on paypal.com and is sent back to our return_url.
 *   3. PayPal POSTs a `CHECKOUT.ORDER.APPROVED` webhook to our per-gateway sink.
 *      handleWebhook verifies the signature, captures the money with
 *      POST /v2/checkout/orders/{id}/capture, and reports the order PAID. The
 *      later `PAYMENT.CAPTURE.COMPLETED` event is handled idempotently.
 *
 * Credentials (gateway `config`, encrypted at rest):
 *   - clientId     → OAuth2 client id (also HTTP Basic user for the token call)
 *   - clientSecret → OAuth2 client secret (HTTP Basic password)
 *   - webhookId    → id of the webhook registered in the PayPal dashboard, used
 *                    to verify incoming notifications.
 *
 * Sandbox vs. production is the base host, chosen by the gateway's `live` flag.
 */

const SANDBOX_BASE = "https://api-m.sandbox.paypal.com";
const LIVE_BASE = "https://api-m.paypal.com";

// PayPal rejects decimal amounts for these currencies; everything else is
// 2-decimal. (Its full "currencies not supporting decimals" list.)
const ZERO_DECIMAL = new Set(["HUF", "JPY", "TWD"]);

function baseUrl(live: boolean): string {
  return live ? LIVE_BASE : SANDBOX_BASE;
}

/** Format a decimal amount as the fixed-precision string PayPal expects. */
function formatAmount(amount: number | string, currencyCode: string): string {
  const decimals = ZERO_DECIMAL.has(currencyCode.toUpperCase()) ? 0 : 2;
  return Number(amount).toFixed(decimals);
}

/**
 * Fetch an OAuth2 access token via client-credentials. Short-lived; we mint a
 * fresh one per request rather than cache it (checkout traffic is low and a
 * per-gateway cache would need invalidation on credential edits).
 */
async function accessToken(
  config: GatewayConfig,
  base: string
): Promise<string> {
  if (!config.clientId || !config.clientSecret) {
    throw new Error("PayPal: faltan clientId/clientSecret en el gateway");
  }
  const basic = Buffer.from(
    `${config.clientId}:${config.clientSecret}`
  ).toString("base64");

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`PayPal: no se pudo obtener el token (${res.status}) ${detail}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("PayPal: la respuesta del token no trae access_token");
  }
  return json.access_token;
}

/** The subset of order data the create-order payload needs. */
type PayableSubset = Pick<
  PayableOrder,
  "id" | "number" | "total" | "currencyCode" | "items" | "customer"
>;

/** Build the v2 create-order body for an order (single purchase unit). */
function buildOrderBody(order: PayableSubset, ctx: PaymentContext) {
  const currency = order.currencyCode.toUpperCase();
  const value = formatAmount(Number(order.total), currency);
  const c = order.customer;

  return {
    intent: "CAPTURE",
    purchase_units: [
      {
        // Echoed back on the capture/order webhooks → resolves our order.
        custom_id: order.id,
        invoice_id: order.number,
        description: order.items[0]?.productName ?? `Pedido ${order.number}`,
        amount: { currency_code: currency, value },
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          brand_name: "TBS",
          locale: "es-ES",
          shipping_preference: "NO_SHIPPING", // digital goods
          user_action: "PAY_NOW",
          return_url: `${ctx.baseUrl}/orders/${order.id}?paid=1`,
          cancel_url: `${ctx.baseUrl}/orders/${order.id}`,
        },
      },
    },
    ...(c.email ? { payer: { email_address: c.email } } : {}),
  };
}

type PayPalLink = { href: string; rel: string; method?: string };

/** The URL PayPal wants the buyer redirected to for approval. */
function approveUrl(links: PayPalLink[] | undefined): string | undefined {
  const link = links?.find(
    (l) => l.rel === "payer-action" || l.rel === "approve"
  );
  return link?.href;
}

/**
 * Verify a webhook against PayPal's verification endpoint. PayPal signs with a
 * rotating cert, so (unlike Stripe's shared secret) verification is an API call
 * that echoes the transmission headers + our stored webhookId back to PayPal.
 */
async function verifySignature(
  rawBody: string,
  headers: Headers,
  config: GatewayConfig,
  base: string,
  token: string
): Promise<boolean> {
  if (!config.webhookId) {
    throw new Error("PayPal: falta webhookId en el gateway");
  }
  const required = [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ];
  for (const h of required) {
    if (!headers.get(h)) return false; // not a genuine PayPal delivery
  }

  const res = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: config.webhookId,
      // The event must be the parsed body, sent back verbatim.
      webhook_event: JSON.parse(rawBody),
    }),
  });
  if (!res.ok) return false;
  const json = (await res.json()) as { verification_status?: string };
  return json.verification_status === "SUCCESS";
}

/**
 * Capture an approved order. Idempotent: a re-delivered APPROVED event (or a
 * race with the buyer's return) can trigger this twice, and PayPal answers the
 * second call with 422/ORDER_ALREADY_CAPTURED, which we treat as success.
 */
async function captureOrder(
  paypalOrderId: string,
  base: string,
  token: string
): Promise<void> {
  const res = await fetch(
    `${base}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        // Idempotency key so retried captures don't double-charge.
        "PayPal-Request-Id": `capture-${paypalOrderId}`,
      },
    }
  );
  if (res.status === 201 || res.status === 200) return;

  const detail = await res.text().catch(() => "");
  if (res.status === 422 && detail.includes("ORDER_ALREADY_CAPTURED")) return;
  throw new Error(`PayPal: captura falló (${res.status}) ${detail}`);
}

/** Pull our order id (custom_id) out of the various webhook resource shapes. */
function ourOrderIdFrom(resource: Record<string, unknown> | undefined): string | undefined {
  if (!resource) return undefined;
  // Capture events carry custom_id at the top level.
  if (typeof resource.custom_id === "string") return resource.custom_id;
  // Order events carry it inside the purchase unit.
  const units = resource.purchase_units as
    | Array<{ custom_id?: string }>
    | undefined;
  return units?.[0]?.custom_id;
}

/** Pull the PayPal order id (our paymentRef) out of a webhook resource. */
function paypalOrderIdFrom(
  resource: Record<string, unknown> | undefined,
  eventType: string
): string | undefined {
  if (!resource) return undefined;
  // For order events the resource id IS the order id.
  if (eventType.startsWith("CHECKOUT.ORDER") && typeof resource.id === "string") {
    return resource.id;
  }
  // Capture events nest it under supplementary_data.related_ids.order_id.
  const sup = resource.supplementary_data as
    | { related_ids?: { order_id?: string } }
    | undefined;
  return sup?.related_ids?.order_id;
}

export const paypalAdapter: PaymentAdapter = {
  provider: "paypal",

  async createPayment(order, config, ctx) {
    const base = baseUrl(ctx.live);
    const token = await accessToken(config, base);

    const res = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        // Idempotent create: a resubmitted checkout reuses the same PayPal order.
        "PayPal-Request-Id": `order-${order.id}`,
      },
      body: JSON.stringify(buildOrderBody(order, ctx)),
    });
    if (res.status !== 201 && res.status !== 200) {
      const detail = await res.text().catch(() => "");
      throw new Error(`PayPal: no se pudo crear la orden (${res.status}) ${detail}`);
    }
    const json = (await res.json()) as { id?: string; links?: PayPalLink[] };
    if (!json.id) throw new Error("PayPal: la orden no devolvió id");

    const url = approveUrl(json.links);
    if (!url) throw new Error("PayPal: la orden no trae link de aprobación");

    return { kind: "redirect", url, paymentRef: json.id };
  },

  async handleWebhook(rawBody, headers, config, ctx) {
    if (!ctx) throw new Error("PayPal: falta el contexto para el webhook");
    const base = baseUrl(ctx.live);
    const token = await accessToken(config, base);

    const ok = await verifySignature(rawBody, headers, config, base, token);
    // Throw so the route answers 400 and PayPal retries a genuine-but-transient
    // failure; a forged event never verifies and is rejected the same way.
    if (!ok) throw new Error("PayPal: firma del webhook inválida");

    const event = JSON.parse(rawBody) as {
      event_type?: string;
      resource?: Record<string, unknown>;
    };
    const type = event.event_type ?? "";
    const resource = event.resource;
    const orderId = ourOrderIdFrom(resource);
    const paypalOrderId = paypalOrderIdFrom(resource, type);

    switch (type) {
      case "CHECKOUT.ORDER.APPROVED": {
        // Buyer approved but the money isn't moved until we capture.
        if (!paypalOrderId) return null;
        await captureOrder(paypalOrderId, base, token);
        return {
          orderId,
          paymentRef: paypalOrderId,
          status: "PAID",
          raw: rawBody,
        } satisfies WebhookResult;
      }
      case "PAYMENT.CAPTURE.COMPLETED": {
        // Fires after our capture (or an auto-captured flow). Idempotent PAID.
        return {
          orderId,
          paymentRef: paypalOrderId,
          status: "PAID",
          raw: rawBody,
        } satisfies WebhookResult;
      }
      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.DECLINED": {
        return {
          orderId,
          paymentRef: paypalOrderId,
          status: "FAILED",
          raw: rawBody,
        } satisfies WebhookResult;
      }
      case "PAYMENT.CAPTURE.REFUNDED":
      case "PAYMENT.CAPTURE.REVERSED": {
        return {
          orderId,
          paymentRef: paypalOrderId,
          status: "REFUNDED",
          raw: rawBody,
        } satisfies WebhookResult;
      }
      default:
        return null;
    }
  },
};
