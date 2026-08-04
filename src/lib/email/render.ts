import { formatPrice } from "@/lib/currency-resolver";

/** The flat variable bag a template is rendered against. */
export type TemplateVars = Record<string, string>;

/** Escape a scalar value before interpolating it into HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Replace `{{ name }}` placeholders with values. Scalar values are HTML-escaped;
 * keys ending in `List` (e.g. `itemsList`) carry markup we built ourselves and
 * are injected verbatim. Unknown placeholders are left blank.
 */
export function renderTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{\s*([\w]+)\s*\}\}/g, (_m, name: string) => {
    const value = vars[name];
    if (value == null) return "";
    return name.endsWith("List") ? value : escapeHtml(value);
  });
}

/** Order shape needed to build the variables for an order email. */
export type OrderForEmail = {
  number: string;
  total: unknown; // Prisma Decimal
  currency: { code: string };
  customer: { name: string };
  items: { productName: string; quantity: number; unitPrice: unknown }[];
  paymentMethod?: string | null;
  createdAt?: Date;
};

/** A receipt-style line: "Producto × 2 ............ 200,00 €". */
function itemRow(label: string, amount: string): string {
  return (
    `<div style="display:flex;justify-content:space-between;font-size:14px;padding:4px 0">` +
    `<span>${label}</span><span>${amount}</span></div>`
  );
}

/** Build the template variables from an order + site context. */
export function buildOrderVars(
  order: OrderForEmail,
  ctx: { siteName: string; siteUrl: string; orderId: string }
): TemplateVars {
  const code = order.currency.code;
  const itemsList = order.items
    .map((it) => {
      const label =
        escapeHtml(it.productName) + (it.quantity > 1 ? ` × ${it.quantity}` : "");
      const line = formatPrice(Number(it.unitPrice) * it.quantity, code);
      return itemRow(label, escapeHtml(line));
    })
    .join("");

  const orderDate = order.createdAt
    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(
        order.createdAt
      )
    : "";

  return {
    customerName: order.customer.name,
    orderNumber: order.number,
    total: formatPrice(Number(order.total), code),
    itemsList,
    paymentMethod: order.paymentMethod ?? "",
    orderDate,
    orderUrl: `${ctx.siteUrl}/orders/${ctx.orderId}`,
    siteName: ctx.siteName,
  };
}

/** Sample variables for the admin preview (no real order needed). */
export function sampleVars(siteName = "Traders Business School"): TemplateVars {
  return {
    customerName: "María García",
    orderNumber: "TBS-000123",
    total: "297,00 €",
    itemsList:
      itemRow("Curso de Trading Avanzado", "297,00 €"),
    paymentMethod: "Tarjeta (Stripe)",
    orderDate: "4 de agosto de 2026",
    orderUrl: "#",
    siteName,
  };
}
