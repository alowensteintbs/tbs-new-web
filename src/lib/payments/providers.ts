/**
 * Registry of supported payment providers.
 *
 * A `PaymentGateway` row stores a `provider` key (e.g. "stripe") plus a JSON
 * `config` blob. This registry declares, per provider, which credential fields
 * that blob holds and how to render them in the admin form. Adding a new
 * provider is a matter of appending an entry here (and later wiring its
 * integration) — no schema migration is needed.
 */

export type CredentialField = {
  key: string;
  label: string;
  /** Sensitive values are encrypted at rest and masked in the form. */
  secret?: boolean;
  placeholder?: string;
  help?: string;
  /**
   * When set, the admin renders a `<select>` with these options instead of a
   * free-text input (avoids typos on constrained values). Not for secrets.
   */
  options?: { value: string; label: string }[];
};

export type PaymentProvider = {
  key: string;
  label: string;
  /** Short note shown under the provider selector in the admin. */
  description: string;
  /** Fields persisted (encrypted) in the gateway's `config`. */
  fields: CredentialField[];
};

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    key: "stripe",
    label: "Stripe",
    description: "Tarjetas y wallets. Global, fuerte en EUR/USD.",
    fields: [
      { key: "publishableKey", label: "Publishable key", placeholder: "pk_live_…" },
      { key: "secretKey", label: "Secret key", secret: true, placeholder: "sk_live_…" },
      {
        key: "webhookSecret",
        label: "Webhook signing secret",
        secret: true,
        placeholder: "whsec_…",
      },
    ],
  },
  {
    key: "paypal",
    label: "PayPal",
    description: "Cuenta PayPal y tarjetas. Global.",
    fields: [
      { key: "clientId", label: "Client ID", placeholder: "AY…" },
      { key: "clientSecret", label: "Client secret", secret: true },
      {
        key: "webhookId",
        label: "Webhook ID",
        placeholder: "WH-…",
        help: "El ID del webhook creado en el panel de PayPal (Apps & Credentials → tu app → Webhooks). Se usa para verificar la firma de las notificaciones. Apuntá el webhook a /api/payments/webhook/<id-del-gateway>.",
      },
    ],
  },
  // Nota: Klarna, Afterpay/Clearpay y Affirm NO son pasarelas propias acá — son
  // métodos de pago BNPL de Stripe. Se activan en el Dashboard de Stripe y
  // aparecen solos en el checkout embebido (dynamic payment methods), sin
  // gateway ni adapter aparte. SeQura sí es propia porque tiene su API directa.
  {
    key: "sequra",
    label: "SeQura",
    description: "Pago fraccionado / financiación. EUR.",
    fields: [
      {
        key: "merchantRef",
        label: "Merchant ID",
        placeholder: "logeecom_test",
        help: "El merchant id de SeQura (va en el payload del pedido).",
      },
      { key: "username", label: "API username" },
      {
        key: "secret",
        label: "API secret",
        secret: true,
        help: "Usá credenciales de sandbox para probar antes de pasar a live.",
      },
    ],
  },
  {
    key: "aplazame",
    label: "Aplazame",
    description: "Pago fraccionado / financiación (BNPL). EUR.",
    fields: [
      {
        key: "privateKey",
        label: "Clave privada de API",
        secret: true,
        help: "Bearer token de Aplazame. Usá la clave de sandbox para probar y la de producción al pasar a live. Autentica tanto la creación del checkout como las notificaciones (webhook).",
      },
      {
        key: "productType",
        label: "Modalidad a ofrecer",
        help: "Elegí qué financiación mostrar en el checkout de Aplazame. «Que elija el comprador» ofrece todas las modalidades habilitadas en tu cuenta.",
        options: [
          { value: "", label: "Que elija el comprador (todas)" },
          { value: "instalments", label: "A plazos (instalments)" },
          { value: "pay_in_4", label: "En 4 pagos (pay_in_4)" },
          { value: "pay_later", label: "Pago aplazado (pay_later)" },
        ],
      },
    ],
  },
  {
    key: "dlocal",
    label: "dLocal",
    description:
      "Pagos en mercados emergentes (LatAm, África, Asia). Redirección al checkout local.",
    fields: [
      {
        key: "login",
        label: "X-Login",
        placeholder: "tu x-login de dLocal",
        help: "Identificador de login del comercio (header X-Login).",
      },
      { key: "transKey", label: "X-Trans-Key", secret: true },
      {
        key: "secretKey",
        label: "Secret Key",
        secret: true,
        help: "Clave secreta usada para firmar (HMAC-SHA256) las peticiones y verificar las notificaciones. Usá credenciales de sandbox para probar.",
      },
    ],
  },
  {
    key: "manual",
    label: "Transferencia / Manual",
    description:
      "Sin API: el cliente paga por fuera y marcás el pedido como pagado a mano.",
    fields: [
      {
        key: "instructions",
        label: "Instrucciones de pago",
        placeholder: "Datos bancarios, IBAN, concepto…",
        help: "Se muestran al comprador en el checkout.",
      },
    ],
  },
];

const BY_KEY = new Map(PAYMENT_PROVIDERS.map((p) => [p.key, p]));

export function getProvider(key: string): PaymentProvider | undefined {
  return BY_KEY.get(key);
}

export function isKnownProvider(key: string): boolean {
  return BY_KEY.has(key);
}
