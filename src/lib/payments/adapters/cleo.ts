import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { GatewayConfig, PaymentAdapter } from "../types";

/** Cleo hosted BNPL checkout for Chile (CLP only). */
const SANDBOX_BASE = "https://sandbox-api-bnpl.cleo.cl";
const LIVE_BASE = "https://api-bnpl.cleo.cl";

type CleoSession = {
  session_id?: string;
  checkout_url?: string;
  merchant_order_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  paid?: boolean;
  expired?: boolean;
  cancelled?: boolean;
};

type CleoCallback = {
  callbackId?: number;
  event?: string;
  payload?: {
    sessionId?: string;
  };
};

function baseUrl(live: boolean): string {
  return live ? LIVE_BASE : SANDBOX_BASE;
}

function secretKey(config: GatewayConfig): string {
  const value = config.secretKey?.trim();
  if (!value) throw new Error("Cleo: falta la Secret Key en la configuración");
  return value;
}

function bearer(config: GatewayConfig): string {
  return `Bearer ${secretKey(config)}`;
}

/**
 * Cleo currently signs retries but may omit the signature on the first callback.
 * Verify it whenever present; the authenticated status request below remains the
 * source of truth for every callback, signed or not.
 */
function verifySignatureWhenPresent(
  rawBody: string,
  header: string | null,
  config: GatewayConfig
): void {
  if (!header) return;

  const signingSecret = config.webhookSecret?.trim();
  if (!signingSecret) {
    throw new Error("Cleo: llegó una firma pero falta el Webhook Signing Secret");
  }
  if (!/^sha256=[a-f0-9]{64}$/i.test(header)) {
    throw new Error("Cleo: formato de firma inválido");
  }

  const expected = `sha256=${createHmac("sha256", signingSecret)
    .update(rawBody)
    .digest("hex")}`;
  const receivedBytes = Buffer.from(header);
  const expectedBytes = Buffer.from(expected);
  if (
    receivedBytes.length !== expectedBytes.length ||
    !timingSafeEqual(receivedBytes, expectedBytes)
  ) {
    throw new Error("Cleo: firma del callback inválida");
  }
}

function parseCallback(rawBody: string): CleoCallback {
  try {
    const parsed = JSON.parse(rawBody) as CleoCallback;
    if (!parsed || typeof parsed !== "object") throw new Error();
    return parsed;
  } catch {
    throw new Error("Cleo: callback inválido");
  }
}

function checkoutAmount(total: unknown, currencyCode: string): number {
  if (currencyCode.toUpperCase() !== "CLP") {
    throw new Error("Cleo: solo admite pagos en CLP");
  }
  const amount = Number(total);
  if (!Number.isInteger(amount) || amount < 1_000 || amount > 10_000_000) {
    throw new Error("Cleo: el importe debe ser un entero entre 1.000 y 10.000.000 CLP");
  }
  return amount;
}

function assertCheckoutUrl(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("Cleo: la respuesta no incluyó checkout_url");
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") throw new Error();
    return url.toString();
  } catch {
    throw new Error("Cleo: checkout_url no es una URL HTTPS válida");
  }
}

export const cleoAdapter: PaymentAdapter = {
  provider: "cleo",

  async createPayment(order, config, ctx) {
    const amount = checkoutAmount(order.total, order.currencyCode);
    const webhookUrl = `${ctx.baseUrl}/api/payments/webhook/${ctx.gatewayId}`;
    const payload = {
      amount,
      currency: "CLP",
      merchant_order_id: order.id,
      success_url: `${ctx.baseUrl}/orders/${order.id}?paid=1`,
      failure_url: ctx.checkoutUrl ?? `${ctx.baseUrl}/orders/${order.id}`,
      callback_url: webhookUrl,
      callback_failure_url: webhookUrl,
      callback_method: "POST",
      callback_failure_method: "POST",
      expires_in_minutes: 60,
      sign_callback: Boolean(config.webhookSecret?.trim()),
    };

    const res = await fetch(`${baseUrl(ctx.live)}/checkout/v1/sessions`, {
      method: "POST",
      headers: {
        Authorization: bearer(config),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Cleo: creación del checkout falló (${res.status})`);
    }

    const session = (await res.json()) as CleoSession;
    if (typeof session.session_id !== "string" || !session.session_id) {
      throw new Error("Cleo: la respuesta no incluyó session_id");
    }
    return {
      kind: "redirect",
      url: assertCheckoutUrl(session.checkout_url),
      paymentRef: session.session_id,
    };
  },

  async handleWebhook(rawBody, headers, config, ctx) {
    if (!ctx) throw new Error("Cleo: falta el contexto de la pasarela");
    verifySignatureWhenPresent(
      rawBody,
      headers.get("x-cleo-signature"),
      config
    );

    const callback = parseCallback(rawBody);
    const sessionId = callback.payload?.sessionId;
    if (typeof sessionId !== "string" || !sessionId) {
      throw new Error("Cleo: el callback no incluyó sessionId");
    }

    const res = await fetch(
      `${baseUrl(ctx.live)}/checkout/v1/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: { Authorization: bearer(config) },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      throw new Error(`Cleo: consulta de la sesión falló (${res.status})`);
    }

    const session = (await res.json()) as CleoSession;
    if (
      session.session_id !== sessionId ||
      typeof session.merchant_order_id !== "string" ||
      !session.merchant_order_id ||
      typeof session.amount !== "number" ||
      !Number.isInteger(session.amount) ||
      typeof session.currency !== "string" ||
      typeof session.status !== "string" ||
      typeof session.paid !== "boolean"
    ) {
      throw new Error("Cleo: datos de sesión incompletos o inconsistentes");
    }

    const verified = {
      orderId: session.merchant_order_id,
      paymentRef: sessionId,
      verifiedPayment: {
        gatewayId: ctx.gatewayId,
        amount: session.amount,
        currency: session.currency,
      },
      raw: JSON.stringify(session),
    };

    if (session.paid) return { ...verified, status: "PAID" as const };
    if (
      session.status === "DENIED" ||
      session.status === "ERROR" ||
      session.status === "EXPIRED" ||
      session.expired === true
    ) {
      return { ...verified, status: "FAILED" as const };
    }

    // Intermediate identity, bank and payment-method steps remain pending.
    return null;
  },
};
