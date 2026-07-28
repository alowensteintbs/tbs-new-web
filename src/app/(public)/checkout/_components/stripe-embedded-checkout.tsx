"use client";

import { useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

/**
 * Stripe embedded Checkout, mounted inline on our checkout page. The
 * `clientSecret` comes from a Checkout Session created server-side
 * (`ui_mode: "embedded_page"`); the publishable key is public by design.
 * On completion Stripe redirects to the session's `return_url`
 * (our order status page); the order is confirmed by the webhook, not here.
 */
export function StripeEmbeddedCheckout({
  publishableKey,
  clientSecret,
}: {
  publishableKey: string;
  clientSecret: string;
}) {
  const stripePromise = useMemo(
    () => loadStripe(publishableKey),
    [publishableKey]
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-1">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
