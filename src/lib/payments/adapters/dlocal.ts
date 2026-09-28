import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { PayableOrder, PaymentAdapter } from "../types";

/** dLocal Go hosted checkout. SmartFields is a separate, unused integration. */
const SANDBOX_BASE = "https://api-sbx.dlocalgo.com";
const LIVE_BASE = "https://api.dlocalgo.com";

type DlocalGoPayment = {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  redirect_url?: string;
};

function baseUrl(live: boolean): string {
  return live ? LIVE_BASE : SANDBOX_BASE;
}

function credentials(config: Record<string, string>) {
  const apiKey = config.apiKey?.trim();
  const secretKey = config.apiSecret?.trim();
  if (!apiKey || !secretKey) {
    throw new Error("dLocal Go: faltan API Key y Secret en la configuración");
  }
  return { apiKey, secretKey };
}

function authorization(apiKey: string, secretKey: string): string {
  return `Bearer ${apiKey}:${secretKey}`;
}

function verifyNotification(rawBody: string, header: string | null, apiKey: string, secretKey: string) {
  const signature = /^V2-HMAC-SHA256,\s*Signature:\s*([a-f0-9]{64})$/i.exec(header ?? "")?.[1];
  if (!signature) throw new Error("dLocal Go: falta la firma de la notificación");

  const expected = createHmac("sha256", secretKey)
    .update(apiKey + rawBody)
    .digest();
  const received = Buffer.from(signature, "hex");
  if (!timingSafeEqual(received, expected)) {
    throw new Error("dLocal Go: firma de la notificación inválida");
  }
}

function payerName(order: PayableOrder): string {
  return [order.customer.name, order.customer.surname].filter(Boolean).join(" ").trim();
}

export const dlocalAdapter: PaymentAdapter = {
  provider: "dlocal",

  async createPayment(order, config, ctx) {
    const { apiKey, secretKey } = credentials(config);
    const country = order.customer.country?.toUpperCase();
    if (!country) throw new Error("dLocal Go: falta el país del comprador");

    const payload = {
      amount: Number(Number(order.total).toFixed(2)),
      currency: order.currencyCode.toUpperCase(),
      country,
      order_id: order.id,
      payer: {
        name: payerName(order),
        email: order.customer.email,
        ...(order.customer.phone ? { phone: order.customer.phone } : {}),
      },
      success_url: `${ctx.baseUrl}/orders/${order.id}?paid=1`,
      back_url: ctx.checkoutUrl ?? `${ctx.baseUrl}/orders/${order.id}`,
      notification_url: `${ctx.baseUrl}/api/payments/webhook/${ctx.gatewayId}`,
    };

    const res = await fetch(`${baseUrl(ctx.live)}/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization(apiKey, secretKey),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`dLocal Go: creación del pago falló (${res.status})`);
    }

    const payment = (await res.json()) as DlocalGoPayment;
    if (!payment.id || !payment.redirect_url) {
      throw new Error("dLocal Go: la respuesta no incluyó id o redirect_url");
    }
    return { kind: "redirect", url: payment.redirect_url, paymentRef: payment.id };
  },

  async handleWebhook(rawBody, headers, config, ctx) {
    const { apiKey, secretKey } = credentials(config);
    if (!ctx) throw new Error("dLocal Go: falta el contexto de la pasarela");
    verifyNotification(rawBody, headers.get("authorization"), apiKey, secretKey);

    let notification: { payment_id?: unknown };
    try {
      notification = JSON.parse(rawBody) as { payment_id?: unknown };
    } catch {
      throw new Error("dLocal Go: notificación inválida");
    }
    const paymentId = notification.payment_id;
    if (typeof paymentId !== "string" || !/^DP-[A-Za-z0-9-]+$/.test(paymentId)) {
      throw new Error("dLocal Go: falta un payment_id válido");
    }

    // The notification contains only an ID. The authenticated GET is the source
    // of truth for order, amount, currency and final status.
    const res = await fetch(`${baseUrl(ctx.live)}/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: authorization(apiKey, secretKey) },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`dLocal Go: consulta del pago falló (${res.status})`);
    }
    const payment = (await res.json()) as DlocalGoPayment;
    if (
      payment.id !== paymentId ||
      typeof payment.order_id !== "string" ||
      !payment.order_id ||
      typeof payment.amount !== "number" ||
      !Number.isFinite(payment.amount) ||
      typeof payment.currency !== "string"
    ) {
      throw new Error("dLocal Go: datos del pago incompletos o inconsistentes");
    }

    const base = {
      orderId: payment.order_id,
      paymentRef: paymentId,
      verifiedPayment: {
        gatewayId: ctx.gatewayId,
        amount: payment.amount,
        currency: payment.currency,
      },
      raw: JSON.stringify(payment),
    };
    switch (payment.status) {
      case "PAID":
        return { ...base, status: "PAID" as const };
      case "REJECTED":
      case "CANCELLED":
      case "EXPIRED":
        return { ...base, status: "FAILED" as const };
      default:
        // PENDING and unknown statuses never confirm or fail an order.
        return null;
    }
  },
};
