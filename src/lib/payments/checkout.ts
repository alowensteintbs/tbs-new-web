import "server-only";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { getProvider } from "./providers";
import type { GatewayConfig, WebhookResult } from "./types";

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
    select: { id: true, provider: true, name: true },
  });

  return gateways.map((g) => ({
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
 * Returns the affected order id, or null if nothing matched / no state change.
 */
export async function applyWebhookResult(
  result: WebhookResult
): Promise<string | null> {
  if (!result.status) return null;

  const order = await db.order.findFirst({
    where: {
      OR: [
        ...(result.paymentRef ? [{ paymentRef: result.paymentRef }] : []),
        ...(result.orderId ? [{ id: result.orderId }] : []),
      ],
    },
    select: { id: true, status: true, paidAt: true },
  });
  if (!order) return null;

  // Guard against out-of-order / regressive transitions.
  if (result.status === "FAILED" && order.status !== "PENDING") return null;
  if (
    result.status === "REFUNDED" &&
    order.status !== "PAID" &&
    order.status !== "FULFILLED"
  ) {
    return null;
  }
  if (order.status === result.status) {
    // Already in this state; just persist the latest raw payload for auditing.
    if (result.raw) {
      await db.order.update({
        where: { id: order.id },
        data: { paymentMeta: result.raw },
      });
    }
    return null;
  }

  await db.order.update({
    where: { id: order.id },
    data: {
      status: result.status,
      paidAt:
        result.status === "PAID" ? order.paidAt ?? new Date() : order.paidAt,
      paymentMeta: result.raw ?? undefined,
    },
  });

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
