import type { PaymentAdapter } from "./types";
import { manualAdapter } from "./adapters/manual";
import { stripeAdapter } from "./adapters/stripe";
import { sequraAdapter } from "./adapters/sequra";
import { paypalAdapter } from "./adapters/paypal";

/**
 * Registry of payment adapters by provider key. PayPal/etc. are added here as
 * they're implemented; the checkout and webhook routes look adapters up by
 * `gateway.provider` and never know the concrete provider.
 */
const ADAPTERS: Record<string, PaymentAdapter> = {
  [manualAdapter.provider]: manualAdapter,
  [stripeAdapter.provider]: stripeAdapter,
  [sequraAdapter.provider]: sequraAdapter,
  [paypalAdapter.provider]: paypalAdapter,
};

export function getAdapter(provider: string): PaymentAdapter | undefined {
  return ADAPTERS[provider];
}

export * from "./types";
