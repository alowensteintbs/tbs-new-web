import type { PaymentAdapter } from "./types";
import { manualAdapter } from "./adapters/manual";
import { stripeAdapter } from "./adapters/stripe";

/**
 * Registry of payment adapters by provider key. PayPal/etc. are added here as
 * they're implemented; the checkout and webhook routes look adapters up by
 * `gateway.provider` and never know the concrete provider.
 */
const ADAPTERS: Record<string, PaymentAdapter> = {
  [manualAdapter.provider]: manualAdapter,
  [stripeAdapter.provider]: stripeAdapter,
};

export function getAdapter(provider: string): PaymentAdapter | undefined {
  return ADAPTERS[provider];
}

export * from "./types";
