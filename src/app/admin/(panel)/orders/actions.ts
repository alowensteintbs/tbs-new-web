"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";
import type { OrderActor } from "@/lib/orders/audit";
import { ORDER_STATUSES, ORDER_STATUS_TRANSITIONS } from "./_lib/status";
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

const noteSchema = z.object({
  id: z.string().min(1),
  body: z.string().trim().min(1, "La nota no puede estar vacía.").max(10_000),
});

async function getActor(): Promise<OrderActor> {
  const session = await requireSession();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true },
  });
  return { id: session.userId, name: user?.name ?? "Administrador eliminado" };
}

function refreshOrder(id: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

/**
 * Change an order's status from the admin (e.g. confirm a manual transfer →
 * PAID, or cancel). Stamps `paidAt` the first time the order reaches a paid
 * state and keeps it while it stays paid (PAID→FULFILLED→REFUNDED); only a
 * return to an unpaid state (CANCELLED/FAILED/PENDING) clears it.
 */
export async function updateOrderStatus(
  id: string,
  status: string,
  failureReason?: string
): Promise<{ error?: string }> {
  const actor = await getActor();

  const parsed = statusSchema.safeParse({ id, status });
  if (!parsed.success) return { error: "Estado inválido." };

  const order = await db.order.findFirst({
    where: { id: parsed.data.id, deletedAt: null },
    select: { paidAt: true, status: true },
  });
  if (!order) return { error: "El pedido no existe." };

  const nextStatus = parsed.data.status as OrderStatus;
  if (!ORDER_STATUS_TRANSITIONS[order.status]?.includes(nextStatus)) {
    return { error: "La transición de estado no está permitida." };
  }
  const cleanReason = failureReason?.trim().slice(0, 2_000) || null;
  if (nextStatus === "FAILED" && !cleanReason) {
    return { error: "Indica el motivo por el que el pago falló." };
  }
  const isPaidState = PAID_STATES.includes(nextStatus);
  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: parsed.data.id },
      data: {
        status: parsed.data.status as never,
        // Stamp on first entry to a paid state; preserve it while paid; clear
        // only when returning to an unpaid state.
        paidAt: isPaidState ? order.paidAt ?? new Date() : null,
        ...(nextStatus === "FAILED" ? { failureReason: cleanReason } : {}),
      },
    });
    await tx.orderEvent.create({
      data: {
        orderId: parsed.data.id,
        type: "STATUS_CHANGED",
        source: "ADMIN",
        message: `Estado cambiado de ${order.status} a ${nextStatus}.`,
        previousStatus: order.status,
        nextStatus,
        payload: cleanReason ? JSON.stringify({ failureReason: cleanReason }) : null,
        actorId: actor.id,
        actorName: actor.name,
      },
    });
  });

  refreshOrder(parsed.data.id);
  return {};
}

/** Add an immutable internal note to the order timeline. */
export async function addOrderNote(id: string, body: string): Promise<{ error?: string }> {
  const actor = await getActor();
  const parsed = noteSchema.safeParse({ id, body });
  if (!parsed.success) return { error: z.flattenError(parsed.error).formErrors[0] ?? "Nota inválida." };

  const order = await db.order.findFirst({
    where: { id: parsed.data.id, deletedAt: null },
    select: { id: true },
  });
  if (!order) return { error: "El pedido no existe." };

  await db.$transaction([
    db.orderNote.create({
      data: {
        orderId: order.id,
        body: parsed.data.body,
        authorId: actor.id,
        authorName: actor.name,
      },
    }),
    db.orderEvent.create({
      data: {
        orderId: order.id,
        type: "NOTE_ADDED",
        source: "ADMIN",
        message: "Se añadió una nota interna.",
        actorId: actor.id,
        actorName: actor.name,
      },
    }),
  ]);
  refreshOrder(order.id);
  return {};
}

/** Reversible deletion: the order disappears from normal views but remains auditable. */
export async function archiveOrder(id: string): Promise<{ error?: string }> {
  const actor = await getActor();
  const order = await db.order.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, status: true },
  });
  if (!order) return { error: "El pedido no existe o ya fue eliminado." };
  if (["PAID", "FULFILLED", "REFUNDED"].includes(order.status)) {
    return { error: "No se puede eliminar un pedido con un cobro registrado. Cancélalo o conserva su historial." };
  }

  await db.$transaction([
    db.order.update({
      where: { id: order.id },
      data: { deletedAt: new Date(), deletedBy: actor.name },
    }),
    db.orderEvent.create({
      data: {
        orderId: order.id,
        type: "ORDER_ARCHIVED",
        source: "ADMIN",
        message: "Pedido eliminado de las vistas operativas (archivo reversible).",
        actorId: actor.id,
        actorName: actor.name,
      },
    }),
  ]);
  revalidatePath("/admin/orders");
  return {};
}
