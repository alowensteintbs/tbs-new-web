import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { cursosAcademia, inscribirAcademia, solicitudAcademiaSchema } from "./api";

export async function procesarInscripcionAcademia(orderId: string): Promise<{ error?: string }> {
  // El pago ya está confirmado: un fallo de entrega nunca lo revierte.
  try { return await procesar(orderId); }
  catch {
    console.error("[academia] No se pudo registrar o procesar la inscripción del pedido", orderId);
    return { error: "No se pudo procesar la inscripción. Revisá la conexión y las migraciones de la base de datos." };
  }
}

async function procesar(orderId: string): Promise<{ error?: string }> {
  const order = await db.order.findFirst({
    where: { id: orderId, deletedAt: null },
    select: { status: true, customer: { select: { email: true, name: true, surname: true } },
      academiaEstado: true, academiaSolicitud: true, items: { select: { productId: true } } },
  });
  if (!order || !["PAID", "FULFILLED"].includes(order.status)) return { error: "Solo se pueden inscribir pedidos pagados." };
  if (order.academiaEstado === "COMPLETADA") return {};

  // Pedidos anteriores a la integración: tomar una instantánea una sola vez.
  if (!order.academiaSolicitud && order.academiaEstado !== "PROCESANDO") {
    const ids = [...new Set(order.items.map((item) => item.productId).filter((id): id is string => !!id))];
    const products = await db.product.findMany({ where: { id: { in: ids } }, select: { id: true, academyId: true } });
    const completos = order.items.length > 0 && order.items.every((item) => products.some((p) => p.id === item.productId && cursosAcademia([p.academyId]).length > 0));
    if (completos) {
      // Solo completar la instantánea legacy vacía, sin pisar otra entrega.
      await db.order.updateMany({
        where: { id: orderId, academiaSolicitud: null, academiaEstado: { in: ["PENDIENTE", "ERROR"] } },
        data: { academiaSolicitud: JSON.stringify({ email: order.customer.email, firstName: order.customer.name,
          lastName: order.customer.surname ?? "", courseSlugs: cursosAcademia(products.map((p) => p.academyId)) }) },
      });
    }
  }

  const token = randomUUID();
  const now = new Date();
  const claimed = await db.order.updateMany({
    where: { id: orderId, academiaEstado: { not: "COMPLETADA" }, status: { in: ["PAID", "FULFILLED"] }, deletedAt: null,
      OR: [{ academiaBloqueoHasta: null }, { academiaBloqueoHasta: { lt: now } }] },
    data: { academiaEstado: "PROCESANDO", academiaToken: token, academiaBloqueoHasta: new Date(now.getTime() + 120_000), academiaIntentos: { increment: 1 }, academiaError: null },
  });
  if (!claimed.count) return { error: "La inscripción ya está completada o se está procesando. Actualizá el pedido en unos instantes." };
  const snapshot = await db.order.findUniqueOrThrow({ where: { id: orderId }, select: { academiaSolicitud: true } });
  let resultado: { usuarioCreado: boolean; cursos: string[] };
  try {
    const solicitud = solicitudAcademiaSchema.safeParse(JSON.parse(snapshot.academiaSolicitud ?? "null"));
    if (!solicitud.success) {
      throw new Error("El pedido no tiene todos sus cursos configurados. Revisá los slugs de academia de los productos.");
    }
    resultado = await inscribirAcademia(solicitud.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo inscribir en la academia.";
    await db.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({ where: { id: orderId, academiaToken: token },
        data: { academiaEstado: "ERROR", academiaError: message, academiaToken: null, academiaBloqueoHasta: null } });
      if (updated.count) await tx.orderEvent.create({ data: { orderId, type: "ACADEMIA_ERROR", source: "ACADEMIA", message } });
    });
    return { error: message };
  }

  await db.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({ where: { id: orderId, academiaToken: token }, data: {
      academiaEstado: "COMPLETADA", academiaCompletadaAt: new Date(), academiaToken: null, academiaBloqueoHasta: null, academiaError: null,
    } });
    if (!updated.count) return;
    // Si se reembolsó durante la llamada, conservar ese estado financiero.
    const fulfilled = await tx.order.updateMany({ where: { id: orderId, status: "PAID", deletedAt: null }, data: { status: "FULFILLED" } });
    await tx.orderEvent.create({ data: { orderId, type: "ACADEMIA_COMPLETADA", source: "ACADEMIA",
      message: "La academia confirmó el acceso a todos los cursos del pedido.",
      ...(fulfilled.count ? { previousStatus: "PAID", nextStatus: "FULFILLED" } : {}),
      payload: JSON.stringify(resultado),
    } });
  });
  return {};
}
