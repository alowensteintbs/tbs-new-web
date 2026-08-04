import "server-only";
import { db } from "@/lib/db";
import type {
  GatewayConfig,
  PayableOrder,
  PaymentAdapter,
  PaymentContext,
  WebhookResult,
} from "../types";

/**
 * SeQura adapter (Order API — invoicing / part-payment, EUR).
 *
 * SeQura has no Node SDK; this is a thin REST client over `fetch` + HTTP Basic
 * Auth. The flow is a two-way handshake, not a redirect:
 *
 *   1. createPayment → POST /orders (solicitation). SeQura answers 2xx with a
 *      `Location` header = the order URL (its trailing segment is the UUID we
 *      keep as `paymentRef`). We then GET the identification form (an HTML+JS
 *      snippet) and hand it back as `kind: "html"` for the browser to embed.
 *   2. The shopper picks a financing product inside that embedded form.
 *   3. On approval SeQura POSTs an IPN to `merchant.notify_url` (our per-gateway
 *      webhook). handleWebhook confirms the order with PUT /orders/{uuid} and,
 *      on success, reports it PAID.
 *
 * Credentials (gateway `config`, encrypted at rest):
 *   - merchantRef → SeQura merchant id (goes in `merchant.id`)
 *   - username    → Basic Auth user
 *   - secret      → Basic Auth password
 *
 * Sandbox vs. production is the base host, chosen by the gateway's `live` flag.
 */

const SANDBOX_BASE = "https://sandbox.sequrapi.com";
const LIVE_BASE = "https://live.sequrapi.com";

/**
 * SeQura's identification-form resource. `ajax=true` returns the snippet suited
 * for injection into an already-loaded page (we mount it client-side after the
 * server action, not on a full page load). `product` defaults to i1 (invoice).
 */
const FORM_RESOURCE = "form_v2?ajax=true";

function baseUrl(live: boolean): string {
  return live ? LIVE_BASE : SANDBOX_BASE;
}

function authHeader(config: GatewayConfig): string {
  if (!config.username || !config.secret) {
    throw new Error("SeQura: faltan username/secret en el gateway");
  }
  const token = Buffer.from(`${config.username}:${config.secret}`).toString(
    "base64"
  );
  return `Basic ${token}`;
}

/** EUR is 2-decimal; SeQura expects amounts as integer cents. */
function toCents(amount: number | string): number {
  return Math.round(Number(amount) * 100);
}

/** Split our single `name` into SeQura's given_names / surnames. */
function splitName(name: string): { given_names: string; surnames: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { given_names: parts[0], surnames: parts[0] };
  return { given_names: parts[0], surnames: parts.slice(1).join(" ") };
}

/** The subset of order data SeQura's solicitation/confirmation payload needs. */
type SolicitableOrder = Pick<
  PayableOrder,
  "id" | "number" | "currencyCode" | "items" | "customer"
>;

/**
 * The order payload shared by the solicitation (POST) and the confirmation
 * (PUT). Rebuilding it identically on confirm is what lets SeQura detect a cart
 * tampered with between the two steps.
 */
function buildOrderPayload(
  order: SolicitableOrder,
  config: GatewayConfig,
  ctx: PaymentContext
) {
  const items = order.items.map((it) => {
    const priceWithTax = toCents(Number(it.unitPrice));
    return {
      // Courses are digital services (this SeQura contract requires the cart to
      // hold at least one `service` item). `ends_in` sets the access period.
      type: "service",
      reference: it.productName,
      name: it.productName,
      price_with_tax: priceWithTax,
      quantity: it.quantity,
      total_with_tax: priceWithTax * it.quantity,
      downloadable: true,
      ends_in: "P1Y", // 1 año de acceso (ISO-8601)
      rendered: false,
    };
  });
  const orderTotal = items.reduce((sum, it) => sum + it.total_with_tax, 0);
  const c = order.customer;
  // Prefer the explicit surname collected at checkout; fall back to splitting
  // the full name for older orders that predate the address fields.
  const split = splitName(c.name);
  const given_names = c.name || split.given_names;
  const surnames = c.surname || split.surnames;
  const country = (c.country ?? "ES").toUpperCase();

  // Both addresses are mandatory in SeQura's payload; the checkout collects them.
  const address = {
    given_names,
    surnames,
    company: "",
    address_line_1: c.addressLine ?? "",
    address_line_2: "",
    postal_code: c.postalCode ?? "",
    city: c.city ?? "",
    state: c.province ?? "",
    country_code: country,
    phone: c.phone ?? "",
  };

  return {
    order: {
      // No state change at solicitation (null = leave as-is).
      state: null,
      merchant: {
        id: config.merchantRef,
        notify_url: `${ctx.baseUrl}/api/payments/webhook/${ctx.gatewayId}`,
        return_url: `${ctx.baseUrl}/orders/${order.id}?paid=1`,
        // Echoed back on the IPN so we can resolve our order without the UUID.
        notification_parameters: { order_id: order.id },
      },
      merchant_reference: { order_ref_1: order.number },
      cart: {
        currency: order.currencyCode.toUpperCase(),
        gift: false,
        order_total_with_tax: orderTotal,
        items,
      },
      // Digital delivery: no shipping. EUR only, country is indistinct.
      delivery_method: { name: "Descarga digital", provider: "digital" },
      delivery_address: address,
      invoice_address: address,
      customer: {
        given_names,
        surnames,
        email: c.email,
        phone: c.phone ?? "",
        logged_in: false,
        language_code: "es-ES",
        // SeQura requires these for fraud screening; the server action does not
        // forward the buyer's request context, so we send sandbox-safe defaults.
        ip_number: "127.0.0.1",
        user_agent: "TBS-Checkout",
      },
      // Shop platform metadata (informational, but mandatory).
      gui: { layout: "desktop" },
      platform: {
        name: "TBS",
        version: "1.0.0",
        uname: "linux",
        db_name: "mysql",
        db_version: "8.0",
        plugin_version: "1.0.0",
      },
    },
  };
}

/** Last path segment of the order URL SeQura returns in `Location`. */
function uuidFromLocation(location: string): string {
  return location.replace(/\/+$/, "").split("/").pop() ?? "";
}

export const sequraAdapter: PaymentAdapter = {
  provider: "sequra",

  async createPayment(order, config, ctx) {
    if (!config.merchantRef) {
      throw new Error("SeQura: falta merchantRef (merchant id) en el gateway");
    }
    const base = baseUrl(ctx.live);
    const auth = authHeader(config);

    // 1) Solicitation — SeQura returns the order URL in the Location header.
    const solicit = await fetch(`${base}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: auth,
      },
      body: JSON.stringify(buildOrderPayload(order, config, ctx)),
    });
    if (solicit.status !== 201 && solicit.status !== 204) {
      const detail = await solicit.text().catch(() => "");
      throw new Error(`SeQura: solicitud falló (${solicit.status}) ${detail}`);
    }
    const location = solicit.headers.get("location");
    if (!location) {
      throw new Error("SeQura: la solicitud no devolvió el header Location");
    }
    const uuid = uuidFromLocation(location);

    // 2) Fetch the identification form (HTML+JS) to embed on our checkout page.
    const formRes = await fetch(`${location}/${FORM_RESOURCE}`, {
      method: "GET",
      headers: { Accept: "text/html", Authorization: auth },
    });
    if (!formRes.ok) {
      const detail = await formRes.text().catch(() => "");
      throw new Error(`SeQura: no se pudo obtener el formulario (${formRes.status}) ${detail}`);
    }
    const html = await formRes.text();

    return { kind: "html", html, paymentRef: uuid };
  },

  async handleWebhook(rawBody, _headers, config, ctx) {
    if (!ctx) throw new Error("SeQura: falta el contexto para confirmar el IPN");

    // The IPN arrives form-encoded or JSON depending on config; accept both.
    const params = parseIpn(rawBody);
    const uuid = params.order_ref ?? params.order_ref_1;
    const ourOrderId = params.order_id;
    if (!uuid && !ourOrderId) return null;

    // Resolve the order — by our stored paymentRef (the UUID) or the echoed id.
    const order = await db.order.findFirst({
      where: {
        OR: [
          ...(uuid ? [{ paymentRef: uuid }] : []),
          ...(ourOrderId ? [{ id: ourOrderId }] : []),
        ],
      },
      select: {
        id: true,
        number: true,
        currency: { select: { code: true } },
        customer: {
          select: {
            email: true,
            name: true,
            surname: true,
            phone: true,
            addressLine: true,
            city: true,
            postalCode: true,
            province: true,
            country: true,
          },
        },
        items: {
          select: { productName: true, unitPrice: true, quantity: true },
        },
      },
    });
    if (!order) return null;

    const orderUuid = uuid || order.id;
    const base = baseUrl(ctx.live);

    // Confirm the order: PUT the (rebuilt) payload. SeQura moves it out of hold
    // and, for a matching cart, accepts the credit risk.
    const payable: SolicitableOrder = {
      id: order.id,
      number: order.number,
      currencyCode: order.currency.code,
      items: order.items,
      customer: order.customer,
    };
    const confirm = await fetch(`${base}/orders/${orderUuid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader(config),
      },
      body: JSON.stringify(buildOrderPayload(payable, config, ctx)),
    });
    if (confirm.status !== 200 && confirm.status !== 204) {
      const detail = await confirm.text().catch(() => "");
      throw new Error(`SeQura: confirmación falló (${confirm.status}) ${detail}`);
    }

    const result: WebhookResult = {
      orderId: order.id,
      paymentRef: uuid || undefined,
      status: "PAID",
      raw: rawBody,
    };
    return result;
  },
};

/** Parse the IPN body (form-encoded or JSON) into a flat string map. */
function parseIpn(rawBody: string): Record<string, string> {
  try {
    const json = JSON.parse(rawBody) as Record<string, unknown>;
    // Flatten a possible { order_ref, notification_parameters: {...} } shape.
    const np = (json.notification_parameters ?? {}) as Record<string, unknown>;
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries({ ...json, ...np })) {
      if (typeof v === "string") flat[k] = v;
    }
    return flat;
  } catch {
    const out: Record<string, string> = {};
    for (const [k, v] of new URLSearchParams(rawBody)) out[k] = v;
    return out;
  }
}
