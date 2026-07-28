import Stripe from "stripe";
import type { PaymentAdapter, GatewayConfig } from "../types";

/**
 * Stripe adapter (embedded Checkout). We create a Checkout Session in
 * `ui_mode: "embedded_page"` and hand its `client_secret` back to the browser,
 * where Stripe.js mounts the payment form inline on our own checkout page — no
 * redirect to checkout.stripe.com. Payment is confirmed asynchronously via the
 * webhook (`checkout.session.completed`), never trusted from the return URL.
 *
 * Credentials live in the gateway `config` (encrypted at rest):
 *   - publishableKey → Stripe publishable key (pk_test_… / pk_live_…), sent to
 *     the client so Stripe.js can render the embedded form.
 *   - secretKey     → Stripe API secret (sk_test_… / sk_live_…)
 *   - webhookSecret → signing secret of the webhook endpoint (whsec_…)
 */

// Stripe expects amounts in the smallest currency unit. Most currencies are
// 2-decimal (cents); these are zero-decimal and take the amount verbatim.
const ZERO_DECIMAL = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG",
  "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

/** Convert a decimal amount + ISO currency to Stripe's minor-unit integer. */
function toMinorUnits(amount: number, currencyCode: string): number {
  if (ZERO_DECIMAL.has(currencyCode.toUpperCase())) return Math.round(amount);
  return Math.round(amount * 100);
}

function clientFor(config: GatewayConfig): Stripe {
  if (!config.secretKey) throw new Error("Stripe: falta secretKey en el gateway");
  return new Stripe(config.secretKey);
}

export const stripeAdapter: PaymentAdapter = {
  provider: "stripe",

  async createPayment(order, config, ctx) {
    const stripe = clientFor(config);
    const currency = order.currencyCode.toLowerCase();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Inline form on our own page instead of the hosted checkout.stripe.com.
      ui_mode: "embedded_page",
      // Reconciliation handles are stamped both on the session and the
      // resulting PaymentIntent/Charge so any webhook can resolve the order.
      client_reference_id: order.id,
      metadata: { orderId: order.id, orderNumber: order.number },
      payment_intent_data: {
        metadata: { orderId: order.id, orderNumber: order.number },
      },
      customer_email: order.customer.email,
      line_items: order.items.map((it) => ({
        quantity: it.quantity,
        price_data: {
          currency,
          unit_amount: toMinorUnits(Number(it.unitPrice), order.currencyCode),
          product_data: { name: it.productName },
        },
      })),
      // After the embedded form completes, Stripe redirects the buyer here
      // (required for embedded_page). The real state still comes from the
      // webhook, so this just routes back to our order status page.
      return_url: `${ctx.baseUrl}/orders/${order.number}?paid=1`,
    });

    if (!session.client_secret) {
      throw new Error("Stripe: la sesión no devolvió client_secret");
    }
    return {
      kind: "embedded",
      clientSecret: session.client_secret,
      paymentRef: session.id,
    };
  },

  async handleWebhook(rawBody, headers, config) {
    if (!config.webhookSecret) {
      throw new Error("Stripe: falta webhookSecret en el gateway");
    }
    const signature = headers.get("stripe-signature");
    if (!signature) return null;

    const stripe = clientFor(config);
    // Throws on a bad signature → the route returns 400 and Stripe retries.
    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      config.webhookSecret
    );

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const s = event.data.object;
        // A completed session may still be unpaid for delayed methods; only
        // mark PAID once Stripe reports the money as settled.
        if (s.payment_status !== "paid") return null;
        return {
          orderId: s.client_reference_id ?? s.metadata?.orderId,
          paymentRef: s.id,
          status: "PAID",
          raw: JSON.stringify(event),
        };
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const s = event.data.object;
        return {
          orderId: s.client_reference_id ?? s.metadata?.orderId,
          paymentRef: s.id,
          status: "FAILED",
          raw: JSON.stringify(event),
        };
      }
      case "charge.refunded": {
        const charge = event.data.object;
        // Charges carry the PaymentIntent metadata we stamped at checkout.
        return {
          orderId: charge.metadata?.orderId,
          status: "REFUNDED",
          raw: JSON.stringify(event),
        };
      }
      default:
        return null;
    }
  },
};
