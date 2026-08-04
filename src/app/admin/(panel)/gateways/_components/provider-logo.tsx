import type { ReactElement } from "react";

/**
 * Brand logos for the payment providers, rendered as self-contained inline SVG
 * wordmarks — no remote assets, correct brand colours, crisp at any size. Used
 * in the admin only: the gateway list and the create-form provider picker.
 * Any provider without a bespoke mark falls back to a neutral monogram chip.
 */

const WORDMARK_FONT =
  "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

function Stripe() {
  return (
    <svg viewBox="0 0 66 24" className="h-3.5 w-auto" role="img" aria-label="Stripe">
      <text
        x="0"
        y="19"
        fontFamily={WORDMARK_FONT}
        fontSize="23"
        fontWeight="800"
        letterSpacing="-1.2"
        fill="#635BFF"
      >
        stripe
      </text>
    </svg>
  );
}

function PayPal() {
  return (
    <svg viewBox="0 0 78 24" className="h-3.5 w-auto" role="img" aria-label="PayPal">
      <text
        x="0"
        y="19"
        fontFamily={WORDMARK_FONT}
        fontSize="22"
        fontWeight="800"
        fontStyle="italic"
        letterSpacing="-0.6"
      >
        <tspan fill="#003087">Pay</tspan>
        <tspan fill="#0079C1">Pal</tspan>
      </text>
    </svg>
  );
}

function SeQura() {
  return (
    <svg viewBox="0 0 74 24" className="h-3.5 w-auto" role="img" aria-label="SeQura">
      <text
        x="0"
        y="19"
        fontFamily={WORDMARK_FONT}
        fontSize="22"
        fontWeight="700"
        letterSpacing="-0.5"
        fill="#00A28A"
      >
        se<tspan fontWeight="800" fill="#0B1B34">Q</tspan>ura
      </text>
    </svg>
  );
}

function Aplazame() {
  return (
    <svg viewBox="0 0 92 24" className="h-3.5 w-auto" role="img" aria-label="Aplazame">
      <text
        x="0"
        y="19"
        fontFamily={WORDMARK_FONT}
        fontSize="21"
        fontWeight="800"
        letterSpacing="-0.8"
        fill="#00C08B"
      >
        aplazame
      </text>
    </svg>
  );
}

function DLocal() {
  return (
    <svg viewBox="0 0 66 24" className="h-3.5 w-auto" role="img" aria-label="dLocal">
      <text
        x="0"
        y="19"
        fontFamily={WORDMARK_FONT}
        fontSize="22"
        fontWeight="800"
        letterSpacing="-0.8"
      >
        <tspan fill="#FF4E6A">d</tspan>
        <tspan fill="#1B1B3A">Local</tspan>
      </text>
    </svg>
  );
}

/** Manual / bank transfer: a neutral landmark (bank) glyph, no brand. */
function Manual() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-gray-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Transferencia"
    >
      <path d="M3 21h18" />
      <path d="M5 21V10M9 21V10M15 21V10M19 21V10" />
      <path d="M12 3 3.5 8h17L12 3Z" />
    </svg>
  );
}

const LOGOS: Record<string, () => ReactElement> = {
  stripe: Stripe,
  paypal: PayPal,
  sequra: SeQura,
  aplazame: Aplazame,
  dlocal: DLocal,
  manual: Manual,
};

export function ProviderLogo({ provider }: { provider: string }) {
  const Logo = LOGOS[provider];
  if (Logo) return <Logo />;
  // Fallback: two-letter monogram chip for any provider without a mark yet.
  return (
    <span className="inline-flex h-5 items-center rounded bg-gray-100 px-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
      {provider.slice(0, 2)}
    </span>
  );
}
