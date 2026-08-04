import type { PaymentAdapter } from "./types";
import { manualAdapter } from "./adapters/manual";
import { stripeAdapter } from "./adapters/stripe";
import { sequraAdapter } from "./adapters/sequra";
import { paypalAdapter } from "./adapters/paypal";
import { aplazameAdapter } from "./adapters/aplazame";
import { dlocalAdapter } from "./adapters/dlocal";

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
  [aplazameAdapter.provider]: aplazameAdapter,
  [dlocalAdapter.provider]: dlocalAdapter,
};

export function getAdapter(provider: string): PaymentAdapter | undefined {
  return ADAPTERS[provider];
}

export * from "./types";
