import "server-only";
import { timingSafeEqual } from "node:crypto";
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
 *   1. createPayment → POST /checkout with the order. Aplazame answers 2xx with
 *      a `Location` header = the hosted checkout URL; we redirect the buyer there.
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
 *   - productType → optional; forces a financing plan (instalments | pay_in_4 |
 *                   pay_later). Blank = the buyer chooses at Aplazame's checkout.
 *
 * Sandbox vs. production share the API host; the environment is determined by
 * which private key is used. The gateway's `live` flag stays informational.
 */

const API_BASE = "https://api.aplazame.com";
const API_VERSION = "application/vnd.aplazame.v4+json";

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
  const articles = order.items.map((it) => ({
    id: it.productName,
    name: it.productName,
    quantity: it.quantity,
    price: toCents(Number(it.unitPrice)),
  }));
  // Aplazame validates total_amount === sum(article.price * quantity). Compute
  // it from the items (no shipping/discount for digital courses) so it matches.
  const totalAmount = articles.reduce((sum, a) => sum + a.price * a.quantity, 0);

  const c = order.customer;
  const { first_name, last_name } = splitName(c.name);
  const country = (c.country ?? "ES").toUpperCase();

  const payload: Record<string, unknown> = {
    merchant: {
      notification_url: `${ctx.baseUrl}/api/payments/webhook/${ctx.gatewayId}`,
      success_url: `${ctx.baseUrl}/orders/${order.id}?paid=1`,
      pending_url: `${ctx.baseUrl}/orders/${order.id}?paid=1`,
      error_url: `${ctx.baseUrl}/orders/${order.id}`,
      dismiss_url: `${ctx.baseUrl}/orders/${order.id}`,
      ko_url: `${ctx.baseUrl}/orders/${order.id}`,
    },
    order: {
      // Our order id round-trips as `mid` on the notification; we resolve by it.
      id: order.id,
      total_amount: totalAmount,
      currency: order.currencyCode.toUpperCase(),
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
      headers: {
        Accept: API_VERSION,
        Authorization: bearer(config),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildCheckoutPayload(order, config, ctx)),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Aplazame: creación del checkout falló (${res.status}) ${detail}`);
    }

    // Aplazame returns the hosted checkout URL in the Location header.
    const location = res.headers.get("location");
    if (!location) {
      throw new Error("Aplazame: la creación del checkout no devolvió Location");
    }

    return { kind: "redirect", url: location };
  },

  async handleWebhook(rawBody, headers, config) {
    // Aplazame authenticates the notification with our own private key.
    if (!authIsValid(headers.get("authorization"), config)) {
      throw new Error("Aplazame: firma/autenticación del webhook inválida");
    }

    let event: {
      id?: string;
      status?: string;
      status_reason?: string;
      mid?: string;
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

    const base: WebhookResult = { orderId, paymentRef, raw: rawBody };

    switch (event.status) {
      case "ok": // Final: sale confirmed by Aplazame.
        return { ...base, status: "PAID", ack: ACK_OK };
      case "ko": // Rejected/cancelled by Aplazame.
        return { ...base, status: "FAILED", ack: ACK_KO };
      default: // `pending` / `confirmation_required`: confirm, but don't mark
        // PAID yet — the order stays PENDING until the final `ok` arrives.
        return { ...base, ack: ACK_OK };
    }
  },
};
