import "server-only";
import { randomInt } from "node:crypto";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { getProvider } from "./providers";
import type { GatewayConfig } from "./types";

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
 * Human-friendly, collision-resistant order number, e.g. "TBS-20260616-4827".
 * Date prefix for readability + random suffix; `number` is unique in the DB so
 * the rare clash surfaces as a constraint error and the order is retried.
 */
export function generateOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  const suffix = String(randomInt(0, 10000)).padStart(4, "0");
  return `TBS-${ymd}-${suffix}`;
}
