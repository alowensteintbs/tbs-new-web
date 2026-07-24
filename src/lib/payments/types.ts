import type { Order, OrderItem } from "@/generated/prisma/client";

/** Decrypted gateway credentials/options (shape depends on the provider). */
export type GatewayConfig = Record<string, string>;

/** An order with the data an adapter needs to start a payment. */
export type PayableOrder = Pick<Order, "id" | "number" | "total" | "status"> & {
  currencyCode: string;
  items: Pick<OrderItem, "productName" | "unitPrice" | "quantity">[];
  customer: { email: string; name: string };
};

/**
 * Where to send the buyer after starting a payment.
 * - `redirect`: external provider page (Stripe Checkout, PayPal, …).
 * - `internal`: stay on our site (manual transfer instructions / thank-you).
 */
export type PaymentStart =
  | { kind: "redirect"; url: string; paymentRef?: string }
  | { kind: "internal"; paymentRef?: string };

/**
 * Request-time context the checkout passes to an adapter. Providers that send
 * the buyer off-site (Stripe, PayPal) build their success/cancel URLs from
 * `baseUrl` — the app's public origin, without trailing slash.
 */
export type PaymentContext = {
  baseUrl: string;
};

/** Outcome of processing a provider webhook/notification. */
export type WebhookResult = {
  /** The order this event refers to (our id or a provider ref we can resolve). */
  orderId?: string;
  paymentRef?: string;
  /** New payment state, if the event implies one. */
  status?: "PAID" | "FAILED" | "REFUNDED";
  /** Raw payload to persist for auditing. */
  raw?: string;
};

/**
 * Contract every payment provider implements. New providers add one of these
 * plus a registry entry in `providers.ts` — no schema or checkout changes.
 */
export type PaymentAdapter = {
  provider: string;
  /** Start a payment for an order. Called server-side at checkout. */
  createPayment(
    order: PayableOrder,
    config: GatewayConfig,
    ctx: PaymentContext
  ): Promise<PaymentStart>;
  /**
   * Verify and interpret an incoming webhook. Returns null if the event is
   * irrelevant. Omitted for providers confirmed manually (e.g. transfer).
   */
  handleWebhook?(
    rawBody: string,
    headers: Headers,
    config: GatewayConfig
  ): Promise<WebhookResult | null>;
};
