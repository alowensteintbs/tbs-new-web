import "server-only";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { sendOrderStatusEmail } from "@/lib/email/notify";
import { procesarInscripcionAcademia } from "@/lib/academia/inscripcion";
import { paymentFailureReason } from "@/lib/orders/audit";
import { getProvider } from "./providers";
import type { GatewayConfig, WebhookResult } from "./types";
import { matchesVerifiedPayment } from "./verified-payment";

export type AvailableGateway = {
  id: string;
  provider: string;
  name: string;
  /** Provider's public-facing description (from the registry). */
  description: string;
};

/**
 * Enabled gateways that accept a given currency, in display order. This is the
 * list the buyer chooses from at checkout (auto-filtered by their currency).
 */
export async function getGatewaysForCurrency(
  currencyId: string
): Promise<AvailableGateway[]> {
  const gateways = await db.paymentGateway.findMany({
    where: { enabled: true, currencies: { some: { currencyId } } },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true, provider: true, name: true, config: true },
  });

  // Never offer gateways whose essential credentials are missing. Existing
  // dLocal Payins rows must be reconfigured for dLocal Go before they qualify.
  return gateways.filter((g) => {
    const config = readGatewayConfig(g.config);
    if (g.provider === "dlocal") {
      return Boolean(config.apiKey?.trim() && config.apiSecret?.trim());
    }
    if (g.provider === "cleo") return Boolean(config.secretKey?.trim());
    if (g.provider === "aplazame") {
      return Boolean(config.publicKey?.trim() && config.privateKey?.trim());
    }
    return true;
  }).map((g) => ({
    id: g.id,
    provider: g.provider,
    name: g.name,
    description: getProvider(g.provider)?.description ?? "",
  }));
}

/** Decrypt a gateway's stored credentials. Returns {} if unreadable. */
export function readGatewayConfig(encrypted: string): GatewayConfig {
  try {
    return JSON.parse(decrypt(encrypted)) as GatewayConfig;
  } catch {
    return {};
  }
}

/**
 * Apply a provider webhook result to its order. Resolves the order by our
 * stored `paymentRef` first, then by the explicit `orderId` the adapter parsed
 * from the event. Idempotent and non-regressing: re-delivered events are safe,
 * and a late FAILED/expired event can't undo an already-PAID order.
 *
 * Returns the affected order id, or null if nothing matched. A webhook is
 * logged even when it does not change state, which makes retries visible.
 */
export async function applyWebhookResult(
  result: WebhookResult
): Promise<string | null> {
  if (!result.status) return null;

  const order = await db.order.findFirst({
    where: {
      deletedAt: null,
      ...(result.verifiedPayment
        ? { id: result.orderId ?? "" }
        : {
            OR: [
              ...(result.paymentRef ? [{ paymentRef: result.paymentRef }] : []),
              ...(result.orderId ? [{ id: result.orderId }] : []),
            ],
          }),
    },
    select: {
      id: true,
      status: true,
      paidAt: true,
      gatewayId: true,
      paymentRef: true,
      total: true,
      currency: { select: { code: true } },
    },
  });
  if (!order) return null;

  if (!matchesVerifiedPayment(order, result)) {
    console.error("[webhook:verified-payment] el pago no coincide con el pedido");
    return null;
  }

  // Guard against out-of-order / regressive transitions. We still retain the
  // provider payload as an audit event, but never regress the order itself.
  const isRegressive =
    (result.status === "PENDING" && order.status !== "PENDING") ||
    (result.status === "PAID" && ["FULFILLED", "REFUNDED", "CANCELLED"].includes(order.status)) ||
    (result.status === "FAILED" && order.status !== "PENDING") ||
    (
    result.status === "REFUNDED" &&
    order.status !== "PAID" &&
    order.status !== "FULFILLED"
    );
  let changed = !isRegressive && order.status !== result.status;
  const failureReason =
    result.status === "FAILED"
      ? paymentFailureReason(result.raw) ?? "La pasarela informó que el pago falló, sin detalle adicional."
      : null;

  await db.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: order.id, status: order.status },
      data: {
        ...(changed
          ? {
              status: result.status,
              paidAt:
                result.status === "PAID" ? order.paidAt ?? new Date() : order.paidAt,
            }
          : {}),
        ...(result.raw ? { paymentMeta: result.raw } : {}),
        ...(result.status === "FAILED" ? { failureReason } : {}),
      },
    });
    changed = changed && updated.count > 0;
    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type: isRegressive ? "PAYMENT_WEBHOOK_IGNORED" : "PAYMENT_WEBHOOK",
        source: "PAYMENT",
        message: isRegressive
          ? `Respuesta ${result.status} recibida, sin cambiar el estado por ser tardía o regresiva.`
          : changed
            ? `La pasarela informó un cambio de estado a ${result.status}.`
            : `La pasarela confirmó nuevamente el estado ${result.status}.`,
        previousStatus: order.status,
        nextStatus: changed ? result.status : order.status,
        payload: result.raw ?? null,
      },
    });
  });

  // Fire the transactional email for this transition (best-effort; awaited so it
  // completes before a serverless invocation ends, but never throws).
  if (changed) await sendOrderStatusEmail(order.id, result.status);
  if (result.status === "PAID" && !isRegressive) await procesarInscripcionAcademia(order.id);

  return order.id;
}

/**
 * Human-friendly order number derived from the order's atomic autoincrement
 * `seq`, e.g. "TBS-000123". Sequential and guaranteed unique — no random suffix,
 * so no birthday-collision crash at checkout.
 */
export function formatOrderNumber(seq: number): string {
  return `TBS-${String(seq).padStart(6, "0")}`;
}
