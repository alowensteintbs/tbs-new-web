import "server-only";
import { timingSafeEqual } from "node:crypto";
import { discountedPaymentItems } from "../payment-items";
import type {
  GatewayConfig,
  PayableOrder,
  PaymentAdapter,
  PaymentContext,
  WebhookResult,
} from "../types";

/**
 * Aplazame adapter (BNPL — pago fraccionado / financiación, EUR).
 *
 * Aplazame has no Node dependency here; this is a thin REST client over `fetch`
 * with Bearer auth. The flow is a hosted-checkout redirect + a webhook that is
 * confirmed *in the HTTP response body*, not via a follow-up API call:
 *
 *   1. createPayment → POST /checkout with the order. Some Aplazame accounts
 *      answer with a `Location` header, while the current API flow answers a
 *      checkout `id`; in that case we open checkout.aplazame.com with the id
 *      and the merchant's public key.
 *   2. The buyer completes the payment on Aplazame's page (enters their NIF,
 *      picks a financing plan, passes identity checks).
 *   3. Aplazame POSTs a notification to `merchant.notification_url` (our
 *      per-gateway webhook), authenticated with `Authorization: Bearer <key>`.
 *      We confirm the sale by returning `{"status":"ok"}` in the response body
 *      (`{"status":"ko"}` rejects it). It arrives in two phases: first `pending`
 *      / `confirmation_required` (approved, awaiting our OK) and then `ok`
 *      (final). We mark the order PAID only on the final `ok`.
 *
 * Credentials (gateway `config`, encrypted at rest):
 *   - privateKey  → Bearer token; authenticates both /checkout and the webhook
 *   - publicKey   → identifies the merchant when the buyer opens the hosted
 *                   Aplazame checkout. It is safe to expose in that URL.
 *   - productType → optional; forces a financing plan (instalments | pay_in_4 |
 *                   pay_later). Blank = the buyer chooses at Aplazame's checkout.
 *
 * Sandbox and production share the API host, but the environment is selected
 * explicitly in the `Accept` media type. The gateway's `live` flag therefore
 * determines which header is sent.
 */

const API_BASE = "https://api.aplazame.com";
const LIVE_API_VERSION = "application/vnd.aplazame.v4+json";
const SANDBOX_API_VERSION = "application/vnd.aplazame.sandbox.v4+json";

function apiVersion(live: boolean): string {
  return live ? LIVE_API_VERSION : SANDBOX_API_VERSION;
}

/** Do not attach provider bodies to errors: they can contain buyer data. */
function responseSummary(res: Response, body: string): string {
  const mediaType = res.headers.get("x-aplazame-media-type") ?? "sin X-Aplazame-Media-Type";
  return `${res.status}; ${mediaType}; respuesta de ${body.length} caracteres`;
}

/** EUR is 2-decimal; Aplazame expects amounts as integer cents. */
function toCents(amount: number | string): number {
  return Math.round(Number(amount) * 100);
}

/** Split our single `name` into Aplazame's first_name / last_name. */
function splitName(name: string): { first_name: string; last_name: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: parts[0] };
  return { first_name: parts[0], last_name: parts.slice(1).join(" ") };
}

function bearer(config: GatewayConfig): string {
  if (!config.privateKey) {
    throw new Error("Aplazame: falta la clave privada de API en el gateway");
  }
  return `Bearer ${config.privateKey}`;
}

function checkoutUrl(checkoutId: string, config: GatewayConfig, live: boolean): string {
  if (!config.publicKey?.trim()) {
    throw new Error(
      "Aplazame: creó el checkout, pero falta la clave pública de API para abrirlo"
    );
  }

  const url = new URL("https://checkout.aplazame.com/");
  url.searchParams.set("order", checkoutId);
  url.searchParams.set("public-key", config.publicKey.trim());
  if (!live) url.searchParams.set("sandbox", "true");
  return url.toString();
}

/** JSON ack bodies Aplazame reads to (dis)confirm the sale. */
const ACK_OK = {
  body: JSON.stringify({ status: "ok" }),
  contentType: "application/json",
};
const ACK_KO = {
  body: JSON.stringify({ status: "ko" }),
  contentType: "application/json",
};

/** Constant-time compare of the webhook's Authorization header. */
function authIsValid(header: string | null, config: GatewayConfig): boolean {
  const expected = bearer(config);
  if (!header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function buildCheckoutPayload(order: PayableOrder, config: GatewayConfig, ctx: PaymentContext) {
  const articles = discountedPaymentItems(order, toCents).map((it, index) => ({
    id: `${order.id}-${index + 1}`,
    name: it.productName,
    quantity: 1,
    price: it.amount,
    // Declare the discounted final amount as tax-exempt so Aplazame's pre-tax
    // article price and `total_amount` remain identical.
    tax_rate: 0,
    url: `${ctx.baseUrl}/orders/${order.id}`,
    image_url: `${ctx.baseUrl}/favicon.ico`,
  }));
  // Aplazame validates total_amount === sum(article.price * quantity). The
  // discounted lines above make this match the final amount we stored.
  const totalAmount = articles.reduce((sum, a) => sum + a.price * a.quantity, 0);

  const c = order.customer;
  const { first_name, last_name } = splitName(c.name);
  const country = (c.country ?? "ES").toUpperCase();

  const payload: Record<string, unknown> = {
    merchant: {
      notification_url: `${ctx.baseUrl}/api/payments/webhook/${ctx.gatewayId}`,
      success_url: `${ctx.baseUrl}/orders/${order.id}?paid=1`,
      pending_url: `${ctx.baseUrl}/orders/${order.id}?paid=1`,
      error_url: ctx.checkoutUrl ?? `${ctx.baseUrl}/orders/${order.id}`,
      dismiss_url: ctx.checkoutUrl ?? `${ctx.baseUrl}/orders/${order.id}`,
      ko_url: ctx.checkoutUrl ?? `${ctx.baseUrl}/orders/${order.id}`,
    },
    order: {
      // Our order id round-trips as `mid` on the notification; we resolve by it.
      id: order.id,
      total_amount: totalAmount,
      currency: order.currencyCode.toUpperCase(),
      tax_rate: 0,
      articles,
    },
    customer: {
      email: c.email,
      first_name: c.name || first_name,
      last_name: c.surname || last_name,
      phone: c.phone ?? "",
      language: "es",
      // The buyer enters their NIF (document) on Aplazame's own checkout.
    },
    billing: {
      first_name: c.name || first_name,
      last_name: c.surname || last_name,
      street: c.addressLine ?? "",
      city: c.city ?? "",
      state: c.province ?? "",
      country,
      postcode: c.postalCode ?? "",
    },
    // Aplazame requires a shipping object even for a course delivered online.
    // It has no delivery cost and reuses the address collected at checkout.
    shipping: {
      first_name: c.name || first_name,
      last_name: c.surname || last_name,
      phone: c.phone ?? "",
      street: c.addressLine ?? "",
      city: c.city ?? "",
      state: c.province ?? "",
      country,
      postcode: c.postalCode ?? "",
      name: "Acceso digital",
      price: 0,
      tax_rate: 0,
      method: "pickup_store",
    },
  };

  // Force a financing plan only when the admin configured one; otherwise the
  // buyer picks among the plans enabled on the Aplazame account.
  if (config.productType?.trim()) {
    payload.product = { type: config.productType.trim() };
  }

  return payload;
}

export const aplazameAdapter: PaymentAdapter = {
  provider: "aplazame",

  async createPayment(order, config, ctx) {
    const res = await fetch(`${API_BASE}/checkout`, {
      method: "POST",
      // Keep the checkout URL that Aplazame returns in `Location`. Node's
      // fetch follows redirects by default, which would turn the response into
      // the hosted page's final 200 and hide the URL we need to return.
      redirect: "manual",
      headers: {
        Accept: apiVersion(ctx.live),
        Authorization: bearer(config),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildCheckoutPayload(order, config, ctx)),
    });
    // Older integrations receive the hosted checkout URL directly in Location.
    const location = res.headers.get("location");
    if (location && (res.ok || (res.status >= 300 && res.status < 400))) {
      return { kind: "redirect", url: location };
    }

    const detail = await res.text().catch(() => "");
    if (!res.ok) {
      throw new Error(
        `Aplazame: creación del checkout falló (${responseSummary(res, detail)})`
      );
    }
    // The current documented flow returns `{ id: checkout_id }`: the browser
    // starts the hosted checkout using that id and the merchant public key.
    let checkoutId: string | undefined;
    try {
      const response = JSON.parse(detail) as { id?: unknown };
      if (typeof response.id === "string" && response.id.trim()) {
        checkoutId = response.id;
      }
    } catch {
      // Keep the sanitized error below; provider bodies may include buyer data.
    }
    if (checkoutId) {
      return {
        kind: "redirect",
        url: checkoutUrl(checkoutId, config, ctx.live),
        paymentRef: checkoutId,
      };
    }

    throw new Error(
      `Aplazame: checkout respondió sin URL ni id (${responseSummary(res, detail)})`
    );
  },

  async handleWebhook(rawBody, headers, config, ctx) {
    // Aplazame authenticates the notification with our own private key.
    if (!authIsValid(headers.get("authorization"), config)) {
      throw new Error("Aplazame: firma/autenticación del webhook inválida");
    }

    let event: {
      id?: string;
      status?: string;
      status_reason?: string;
      mid?: string;
      total_amount?: number;
      currency?: { code?: string } | string;
    };
    try {
      event = JSON.parse(rawBody);
    } catch {
      throw new Error("Aplazame: cuerpo del webhook no es JSON válido");
    }

    const orderId = event.mid;
    const paymentRef = event.id;
    // Can't identify our order → reject the confirmation handshake.
    if (!orderId) {
      return { ack: ACK_KO, raw: rawBody };
    }

    const currency =
      typeof event.currency === "string" ? event.currency : event.currency?.code;
    const amount = Number(event.total_amount) / 100;
    if (
      !paymentRef ||
      !currency ||
      !Number.isFinite(amount) ||
      !Number.isInteger(Number(event.total_amount))
    ) {
      // Aplazame authenticated the message, but incomplete payment data must
      // never be enough to confirm one of our orders.
      return { ack: ACK_KO, raw: rawBody };
    }

    // The notification is authenticated by Aplazame with our private key.
    // Still bind its amount, currency and gateway to the local order before a
    // state change, just as the other hosted payment adapters do.
    const base: WebhookResult = {
      orderId,
      paymentRef,
      raw: rawBody,
      verifiedPayment: {
        gatewayId: ctx?.gatewayId ?? "",
        amount,
        currency,
      },
    };

    switch (event.status) {
      case "ok": // Final: sale confirmed by Aplazame.
        return { ...base, status: "PAID", ack: ACK_OK };
      case "ko": // Rejected/cancelled by Aplazame.
        return { ...base, status: "FAILED", ack: ACK_KO };
      default: // `pending` / `confirmation_required`: confirm, but don't mark
        // PAID yet — the order stays PENDING until the final `ok` arrives.
        // Returning PENDING also makes the shared webhook sink verify that
        // this confirmation handshake belongs to a real matching order.
        return { ...base, status: "PENDING", ack: ACK_OK };
    }
  },
};
