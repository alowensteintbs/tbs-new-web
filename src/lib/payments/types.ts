import type { Order, OrderItem } from "@/generated/prisma/client";

/** Decrypted gateway credentials/options (shape depends on the provider). */
export type GatewayConfig = Record<string, string>;

/** An order with the data an adapter needs to start a payment. */
export type PayableOrder = Pick<Order, "id" | "number" | "total" | "status"> & {
  currencyCode: string;
  items: Pick<OrderItem, "productName" | "unitPrice" | "quantity">[];
  /**
   * Buyer details. Address fields are optional in the type (older orders may
   * lack them) but the checkout now collects them; SeQura needs them in the
   * cart/addresses. `country` is ISO-3166-1 alpha-2.
   */
  customer: {
    email: string;
    name: string;
    surname?: string | null;
    phone?: string | null;
    addressLine?: string | null;
    city?: string | null;
    postalCode?: string | null;
    province?: string | null;
    country?: string | null;
  };
};

/**
 * Where to send the buyer after starting a payment.
 * - `redirect`: external provider page (PayPal, hosted Checkout, …).
 * - `embedded`: mount the provider's payment form inline on our checkout page
 *   using `clientSecret` (Stripe embedded Checkout). No off-site redirect.
 * - `html`: an HTML+JS snippet the provider returns (SeQura's identification
 *   form) that we inject verbatim into our checkout page; its own script drives
 *   the flow and the payment is confirmed later via the IPN webhook.
 * - `internal`: stay on our site (manual transfer instructions / thank-you).
 */
export type PaymentStart =
  | { kind: "redirect"; url: string; paymentRef?: string }
  | { kind: "embedded"; clientSecret: string; paymentRef?: string }
  | { kind: "html"; html: string; paymentRef?: string }
  | { kind: "internal"; paymentRef?: string };

/**
 * Request-time context the checkout passes to an adapter. Providers that send
 * the buyer off-site (Stripe, PayPal) build their success/cancel URLs from
 * `baseUrl` — the app's public origin, without trailing slash.
 *
 * `gatewayId` + `live` let an adapter that registers its callback at request
 * time (SeQura embeds `notify_url` in the create call, unlike Stripe which is
 * configured in its dashboard) build its own per-gateway webhook URL and pick
 * the sandbox vs. production host.
 */
export type PaymentContext = {
  baseUrl: string;
  gatewayId: string;
  live: boolean;
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
   *
   * `ctx` is supplied for providers whose notification is a two-way handshake
   * (SeQura's IPN requires a follow-up confirm call to its API, which needs the
   * live flag and base URL); signature-only providers (Stripe) ignore it.
   */
  handleWebhook?(
    rawBody: string,
    headers: Headers,
    config: GatewayConfig,
    ctx?: PaymentContext
  ): Promise<WebhookResult | null>;
};
