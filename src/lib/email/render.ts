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
 * keys ending in `List` or `Html` (e.g. `itemsList`, `discountHtml`) carry markup
 * we built ourselves and are injected verbatim. Unknown placeholders → blank.
 */
export function renderTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{\s*([\w]+)\s*\}\}/g, (_m, name: string) => {
    const value = vars[name];
    if (value == null) return "";
    const raw = name.endsWith("List") || name.endsWith("Html");
    return raw ? value : escapeHtml(value);
  });
}

/** Order shape needed to build the variables for an order email. */
export type OrderForEmail = {
  number: string;
  total: unknown; // Prisma Decimal
  subtotal?: unknown;
  discountAmount?: unknown;
  couponCode?: string | null;
  currency: { code: string };
  customer: { name: string };
  items: { productName: string; quantity: number; unitPrice: unknown }[];
  paymentMethod?: string | null;
  createdAt?: Date;
};

/** A receipt-style line: "Producto × 2 ............ 200,00 €". */
function itemRow(label: string, amount: string, color?: string): string {
  const style = `display:flex;justify-content:space-between;font-size:14px;padding:4px 0${
    color ? `;color:${color}` : ""
  }`;
  return `<div style="${style}"><span>${label}</span><span>${amount}</span></div>`;
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

  // Discount breakdown: a subtotal + discount row shown only when a coupon cut
  // the price. Empty otherwise, so the template's totals stay clean.
  const discountNum = Number(order.discountAmount ?? 0);
  const subtotalLabel = formatPrice(
    Number(order.subtotal ?? order.total),
    code
  );
  const discountLabel = formatPrice(discountNum, code);
  const discountHtml =
    discountNum > 0
      ? itemRow("Subtotal", subtotalLabel) +
        itemRow(
          `Descuento${order.couponCode ? ` (${escapeHtml(order.couponCode)})` : ""}`,
          `−${discountLabel}`,
          "#15803d"
        )
      : "";

  return {
    customerName: order.customer.name,
    orderNumber: order.number,
    subtotal: subtotalLabel,
    discount: discountLabel,
    discountHtml,
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
    subtotal: "297,00 €",
    discount: "0,00 €",
    discountHtml: "",
    total: "297,00 €",
    itemsList: itemRow("Curso de Trading Avanzado", "297,00 €"),
    paymentMethod: "Tarjeta (Stripe)",
    orderDate: "4 de agosto de 2026",
    orderUrl: "#",
    siteName,
  };
}
