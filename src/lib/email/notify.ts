import "server-only";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import { templateKeyForStatus } from "./templates";
import { buildOrderVars, renderTemplate } from "./render";
import { sendEmail } from "./send";

/**
 * Send the transactional email for an order's new status, if a template exists
 * for it and is enabled. Best-effort: any failure is logged, never thrown, so
 * it can't break the payment webhook that calls it. Called from
 * `applyWebhookResult` right after a real status transition.
 */
export async function sendOrderStatusEmail(
  orderId: string,
  status: string
): Promise<void> {
  try {
    const key = templateKeyForStatus(status);
    if (!key) return;

    const template = await db.emailTemplate.findUnique({ where: { key } });
    if (!template || !template.enabled) return;

    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        number: true,
        total: true,
        createdAt: true,
        currency: { select: { code: true } },
        customer: { select: { name: true, email: true } },
        gateway: { select: { name: true } },
        items: {
          select: { productName: true, quantity: true, unitPrice: true },
        },
      },
    });
    if (!order?.customer.email) return;

    const settings = await getSettings();
    const vars = buildOrderVars(
      { ...order, paymentMethod: order.gateway?.name },
      {
        siteName: settings.site_name || "Traders Business School",
        siteUrl: getSiteUrl(),
        orderId,
      }
    );

    const result = await sendEmail({
      to: order.customer.email,
      subject: renderTemplate(template.subject, vars),
      html: renderTemplate(template.html, vars),
    });
    if (result.error) {
      console.error(`[email:${key}] send failed for ${orderId}: ${result.error}`);
    }
  } catch (err) {
    console.error(`[email] unexpected failure for order ${orderId}`, err);
  }
}
