/**
 * Catalog of transactional emails. Each entry declares the order event that
 * triggers it, the variables its template can use, and a starter subject/HTML
 * the admin can edit (or replace wholesale by pasting their own HTML).
 *
 * The `key` matches the `EmailTemplate.key` column. Adding an email = a new
 * entry here plus mapping its `trigger` in `notify.ts`. No schema change.
 */

/** Order statuses that can trigger an email (subset of OrderStatus). */
export type EmailTrigger = "PAID" | "FAILED" | "REFUNDED";

export type EmailVariable = { name: string; description: string };

export type EmailTemplateDef = {
  key: string;
  label: string;
  description: string;
  trigger: EmailTrigger;
  variables: EmailVariable[];
  defaultSubject: string;
  defaultHtml: string;
};

/** Variables every order email receives (see buildOrderVars in render.ts). */
const ORDER_VARIABLES: EmailVariable[] = [
  { name: "customerName", description: "Nombre del comprador" },
  { name: "orderNumber", description: "Número de pedido (TBS-000123)" },
  { name: "orderDate", description: "Fecha del pedido" },
  { name: "paymentMethod", description: "Método de pago (pasarela)" },
  { name: "total", description: "Importe total con moneda" },
  { name: "itemsList", description: "Detalle de productos con precios (HTML)" },
  { name: "orderUrl", description: "Enlace a la página del pedido" },
  { name: "siteName", description: "Nombre del sitio" },
];

/** A neutral responsive wrapper shared by the starter templates. */
function shell(inner: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">
  <h1 style="font-size:20px;margin:0 0 16px">${inner}</h1>
  <p style="font-size:14px;line-height:1.6;color:#4b5563">Pedido <strong>{{orderNumber}}</strong></p>
  <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0">
    {{itemsList}}
    <div style="display:flex;justify-content:space-between;border-top:1px solid #f3f4f6;margin-top:12px;padding-top:12px;font-weight:600">
      <span>Total</span><span>{{total}}</span>
    </div>
  </div>
  <a href="{{orderUrl}}" style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px">Ver mi pedido</a>
  <p style="font-size:12px;color:#9ca3af;margin-top:24px">{{siteName}}</p>
</div>`;
}

/** Receipt layout for the purchase confirmation: adds a date / payment-method
 * meta block on top of the shared shell. Doubles as the order detail receipt. */
function receiptShell(): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">
  <h1 style="font-size:20px;margin:0 0 8px">¡Gracias por tu compra! ✅</h1>
  <p style="font-size:14px;line-height:1.6;color:#4b5563;margin:0 0 16px">Hola {{customerName}}, este es el recibo de tu pedido <strong>{{orderNumber}}</strong>.</p>
  <div style="font-size:13px;color:#6b7280;margin-bottom:12px">
    <span>Fecha: {{orderDate}}</span> &nbsp;·&nbsp; <span>Método de pago: {{paymentMethod}}</span>
  </div>
  <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:0 0 16px">
    {{itemsList}}
    <div style="display:flex;justify-content:space-between;border-top:1px solid #f3f4f6;margin-top:12px;padding-top:12px;font-weight:600">
      <span>Total</span><span>{{total}}</span>
    </div>
  </div>
  <a href="{{orderUrl}}" style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px">Ver mi pedido</a>
  <p style="font-size:12px;color:#9ca3af;margin-top:24px">{{siteName}}</p>
</div>`;
}

export const EMAIL_TEMPLATES: EmailTemplateDef[] = [
  {
    key: "order_paid",
    label: "Compra confirmada",
    description:
      "Se envía al comprador cuando el pago se confirma (PAID). Sirve de recibo con el detalle del pedido.",
    trigger: "PAID",
    variables: ORDER_VARIABLES,
    defaultSubject: "Recibo de tu compra {{orderNumber}}",
    defaultHtml: receiptShell(),
  },
  {
    key: "order_failed",
    label: "Pago fallido",
    description: "Se envía cuando el intento de pago falla (FAILED).",
    trigger: "FAILED",
    variables: ORDER_VARIABLES,
    defaultSubject: "Tu pago no pudo completarse",
    defaultHtml: shell("No pudimos procesar tu pago ⚠️"),
  },
  {
    key: "order_refunded",
    label: "Reembolso",
    description: "Se envía cuando el pedido se reembolsa (REFUNDED).",
    trigger: "REFUNDED",
    variables: ORDER_VARIABLES,
    defaultSubject: "Tu pedido {{orderNumber}} fue reembolsado",
    defaultHtml: shell("Procesamos tu reembolso 💸"),
  },
];

const BY_KEY = new Map(EMAIL_TEMPLATES.map((t) => [t.key, t]));

export function getTemplateDef(key: string): EmailTemplateDef | undefined {
  return BY_KEY.get(key);
}

/** Map an order status to the template key that should fire, if any. */
export function templateKeyForStatus(status: string): string | undefined {
  return EMAIL_TEMPLATES.find((t) => t.trigger === status)?.key;
}
