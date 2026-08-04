import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { PayableOrder, PaymentAdapter } from "../types";

/**
 * dLocal adapter (payins REDIRECT flow — emerging markets, multi-currency).
 *
 * No Node SDK; a thin REST client over `fetch` with dLocal's HMAC-SHA256 header
 * auth. The flow is a hosted-redirect:
 *
 *   1. createPayment → POST /payments with `payment_method_flow: "REDIRECT"`.
 *      dLocal answers with the payment `id`, a `status` (PENDING) and a
 *      `redirect_url`; we send the buyer there to pick a local method and pay.
 *   2. On any status change dLocal POSTs a signed notification to
 *      `notification_url` (our per-gateway webhook). We verify the signature and
 *      map `status`: PAID → PAID; REJECTED/CANCELLED/EXPIRED → FAILED; the rest
 *      (PENDING/AUTHORIZED/VERIFIED) are non-terminal and left as-is. dLocal
 *      only needs a plain 2xx ack, so no response body is required.
 *
 * Auth (every request + notification): the signature is
 *   HMAC_SHA256(secretKey, X-Login + X-Date + body)  (hex)
 * carried in `Authorization: V2-HMAC-SHA256, Signature: <hex>`.
 *
 * Credentials (gateway `config`, encrypted at rest):
 *   - login     → X-Login header
 *   - transKey  → X-Trans-Key header
 *   - secretKey → HMAC signing key (requests + notification verification)
 *
 * Sandbox vs. production is the base host, chosen by the gateway's `live` flag.
 */

const SANDBOX_BASE = "https://sandbox.dlocal.com";
const LIVE_BASE = "https://api.dlocal.com";
const API_VERSION = "2.1";

function baseUrl(live: boolean): string {
  return live ? LIVE_BASE : SANDBOX_BASE;
}

/** dLocal's `Authorization: V2-HMAC-SHA256, Signature: <hex>`. */
function sign(secretKey: string, login: string, xDate: string, body: string): string {
  return createHmac("sha256", secretKey)
    .update(login + xDate + body)
    .digest("hex");
}

/** Split our single `name` into dLocal's payer name (kept whole — it takes one). */
function payerName(order: PayableOrder): string {
  const c = order.customer;
  return [c.name, c.surname].filter(Boolean).join(" ").trim() || c.name;
}

export const dlocalAdapter: PaymentAdapter = {
  provider: "dlocal",

  async createPayment(order, config, ctx) {
    const { login, transKey, secretKey } = config;
    if (!login || !transKey || !secretKey) {
      throw new Error("dLocal: faltan credenciales (login/transKey/secretKey)");
    }
    const country = (order.customer.country ?? "").toUpperCase();
    if (!country) {
      throw new Error("dLocal: falta el país del comprador (requerido)");
    }

    // dLocal amounts are decimal numbers in the currency's normal units (NOT
    // cents); it applies the per-currency decimal rules itself.
    const amount = Number(Number(order.total).toFixed(2));

    const payload: Record<string, unknown> = {
      amount,
      currency: order.currencyCode.toUpperCase(),
      country,
      payment_method_flow: "REDIRECT",
      payer: {
        name: payerName(order),
        email: order.customer.email,
        // `document` (national id) is collected by dLocal on its hosted page
        // for the REDIRECT flow, so we don't send one from checkout.
      },
      order_id: order.id,
      notification_url: `${ctx.baseUrl}/api/payments/webhook/${ctx.gatewayId}`,
      callback_url: `${ctx.baseUrl}/orders/${order.id}?paid=1`,
    };

    const body = JSON.stringify(payload);
    const xDate = new Date().toISOString();
    const res = await fetch(`${baseUrl(ctx.live)}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Date": xDate,
        "X-Login": login,
        "X-Trans-Key": transKey,
        "X-Version": API_VERSION,
        "User-Agent": "TBS-Checkout",
        Authorization: `V2-HMAC-SHA256, Signature: ${sign(secretKey, login, xDate, body)}`,
      },
      body,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`dLocal: creación del pago falló (${res.status}) ${detail}`);
    }

    const json = (await res.json()) as { id?: string; redirect_url?: string };
    if (!json.redirect_url) {
      throw new Error("dLocal: la respuesta no incluyó redirect_url");
    }

    return { kind: "redirect", url: json.redirect_url, paymentRef: json.id };
  },

  async handleWebhook(rawBody, headers, config) {
    const { login, secretKey } = config;
    if (!login || !secretKey) {
      throw new Error("dLocal: faltan credenciales para verificar la notificación");
    }

    // Verify the signature: HMAC over our X-Login + the notification's X-Date +
    // its raw body must match the Signature carried in the Authorization header.
    const xDate = headers.get("x-date") ?? "";
    const authHeader = headers.get("authorization") ?? "";
    const received = /Signature:\s*([a-f0-9]+)/i.exec(authHeader)?.[1] ?? "";
    const expected = sign(secretKey, login, xDate, rawBody);
    const a = Buffer.from(received);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new Error("dLocal: firma de la notificación inválida");
    }

    const event = JSON.parse(rawBody) as {
      id?: string;
      status?: string;
      order_id?: string;
    };
    const orderId = event.order_id;
    if (!orderId) return null;

    const base = { orderId, paymentRef: event.id, raw: rawBody };
    switch (event.status) {
      case "PAID":
        return { ...base, status: "PAID" as const };
      case "REJECTED":
      case "CANCELLED":
      case "EXPIRED":
        return { ...base, status: "FAILED" as const };
      default:
        // PENDING / AUTHORIZED / VERIFIED — non-terminal; acknowledge only.
        return null;
    }
  },
};
