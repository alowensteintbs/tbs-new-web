"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";
import { ORDER_STATUSES } from "./_lib/status";
import type { OrderStatus } from "@/generated/prisma/client";

/**
 * Statuses that imply the buyer's money was received at some point, so `paidAt`
 * must be kept: PAID/FULFILLED are live paid states, REFUNDED was paid then
 * returned. Only truly-unpaid states (PENDING/CANCELLED/FAILED) clear it.
 */
const PAID_STATES: readonly OrderStatus[] = ["PAID", "FULFILLED", "REFUNDED"];

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(ORDER_STATUSES as [string, ...string[]]),
});

/**
 * Change an order's status from the admin (e.g. confirm a manual transfer →
 * PAID, or cancel). Stamps `paidAt` the first time the order reaches a paid
 * state and keeps it while it stays paid (PAID→FULFILLED→REFUNDED); only a
 * return to an unpaid state (CANCELLED/FAILED/PENDING) clears it.
 */
export async function updateOrderStatus(
  id: string,
  status: string
): Promise<{ error?: string }> {
  await requireSession();

  const parsed = statusSchema.safeParse({ id, status });
  if (!parsed.success) return { error: "Estado inválido." };

  const order = await db.order.findUnique({
    where: { id: parsed.data.id },
    select: { paidAt: true },
  });
  if (!order) return { error: "El pedido no existe." };

  const nextStatus = parsed.data.status as OrderStatus;
  const isPaidState = PAID_STATES.includes(nextStatus);
  await db.order.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status as never,
      // Stamp on first entry to a paid state; preserve it while paid; clear
      // only when returning to an unpaid state.
      paidAt: isPaidState ? order.paidAt ?? new Date() : null,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.id}`);
  return {};
}
