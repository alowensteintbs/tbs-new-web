import "server-only";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export type CheckoutOffer = {
  id: string;
  titulo: string;
  descripcion: string;
  productName: string;
  amount: number;
};

export async function getCheckoutOffers(productId: string, currencyId: string): Promise<CheckoutOffer[]> {
  const offers = await db.ofertaCheckout.findMany({
    where: {
      productoPrincipalId: productId,
      activo: true,
      productoPrincipal: { visible: true },
      productoOfrecido: { visible: true },
      NOT: { productoOfrecidoId: productId },
      prices: { some: { currencyId, currency: { enabled: true }, amount: { gte: 0 } } },
    },
    orderBy: [{ posicion: "asc" }, { id: "asc" }],
    select: {
      id: true, titulo: true, descripcion: true,
      productoOfrecido: { select: { name: true } },
      prices: { where: { currencyId }, select: { amount: true } },
    },
  });
  return offers.map((offer) => ({
    id: offer.id, titulo: offer.titulo, descripcion: offer.descripcion,
    productName: offer.productoOfrecido.name, amount: Number(offer.prices[0].amount),
  }));
}

/** Revalidate every selected ID and take all prices from the database. */
export async function resolveOrderBumps(productId: string, currencyId: string, ids: string[]) {
  if (ids.length > 20 || ids.some((id) => !id || id.length > 191) || new Set(ids).size !== ids.length) {
    return { ok: false as const, error: "La selección de ofertas no es válida." };
  }
  const offers = ids.length ? await db.ofertaCheckout.findMany({
    where: {
      id: { in: ids }, productoPrincipalId: productId, activo: true,
      productoOfrecido: { visible: true }, NOT: { productoOfrecidoId: productId },
      prices: { some: { currencyId, currency: { enabled: true }, amount: { gte: 0 } } },
    },
    orderBy: [{ posicion: "asc" }, { id: "asc" }],
    select: {
      id: true,
      productoOfrecido: { select: { id: true, name: true, sku: true } },
      prices: { where: { currencyId }, select: { amount: true } },
    },
  }) : [];
  if (offers.length !== ids.length) {
    return { ok: false as const, error: "Una oferta ya no está disponible para esta compra. Revisa tu selección." };
  }
  const items = offers.map((offer) => ({
    productId: offer.productoOfrecido.id,
    productName: offer.productoOfrecido.name,
    productSku: offer.productoOfrecido.sku,
    unitPrice: new Prisma.Decimal(offer.prices[0].amount),
    quantity: 1,
    discountAmount: new Prisma.Decimal(0),
    ofertaId: offer.id,
    origen: "ORDER_BUMP" as const,
  }));
  return { ok: true as const, items, subtotal: items.reduce((sum, item) => sum.plus(item.unitPrice), new Prisma.Decimal(0)) };
}
