"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";
import { ORDER_STATUSES } from "./_lib/status";

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(ORDER_STATUSES as [string, ...string[]]),
});

/**
 * Change an order's status from the admin (e.g. confirm a manual transfer →
 * PAID, or cancel). Stamps `paidAt` when entering PAID and clears it otherwise,
 * so the timestamp always reflects the current paid state.
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

  const becomingPaid = parsed.data.status === "PAID";
  await db.order.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status as never,
      // Set paidAt on first transition to PAID; clear it if leaving PAID.
      paidAt: becomingPaid ? order.paidAt ?? new Date() : null,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.id}`);
  return {};
}
