"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/dal";

const schema = z.object({
  id: z.string().max(191).optional(),
  productoPrincipalId: z.string().min(1, "Selecciona el producto principal").max(191),
  productoOfrecidoId: z.string().min(1, "Selecciona el producto adicional").max(191),
  titulo: z.string().trim().min(1, "Introduce un título").max(191),
  descripcion: z.string().trim().max(5000),
  activo: z.boolean(),
  posicion: z.coerce.number().int().min(0).max(10000),
}).refine((input) => input.productoPrincipalId !== input.productoOfrecidoId, {
  path: ["productoOfrecidoId"], message: "La oferta debe añadir un producto distinto al principal.",
});

export type OfferFormState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function saveOffer(_prev: OfferFormState, formData: FormData): Promise<OfferFormState> {
  await requireRole("ADMIN", "SUPERADMIN");
  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    productoPrincipalId: formData.get("productoPrincipalId"),
    productoOfrecidoId: formData.get("productoOfrecidoId"),
    titulo: formData.get("titulo"), descripcion: formData.get("descripcion") ?? "",
    activo: formData.get("activo") === "on", posicion: formData.get("posicion") ?? 0,
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const { id, ...input } = parsed.data;
  const [products, currencies] = await Promise.all([
    db.product.findMany({ where: { id: { in: [input.productoPrincipalId, input.productoOfrecidoId] } }, select: { id: true } }),
    db.currency.findMany({ where: { enabled: true }, select: { id: true, code: true } }),
  ]);
  if (products.length !== 2) return { error: "Uno de los productos ya no existe." };
  const prices: { currencyId: string; amount: Prisma.Decimal }[] = [];
  for (const currency of currencies) {
    const raw = formData.get(`price_${currency.id}`);
    if (raw == null || raw === "") continue;
    if (typeof raw !== "string" || !/^\d{1,10}(\.\d{1,2})?$/.test(raw.trim())) {
      return { error: `Introduce un precio válido para ${currency.code}, con hasta dos decimales.` };
    }
    prices.push({ currencyId: currency.id, amount: new Prisma.Decimal(raw.trim()) });
  }
  if (input.activo && prices.length === 0) return { error: "Una oferta activa necesita al menos un precio." };
  try {
    await db.$transaction(async (tx) => {
      if (id) {
        await tx.ofertaCheckout.update({ where: { id }, data: input });
        // Preserve prices in disabled currencies so re-enabling them recovers
        // existing data. Only replace the editable currency set.
        await tx.ofertaCheckoutPrice.deleteMany({ where: { ofertaId: id, currencyId: { in: currencies.map((c) => c.id) } } });
        await tx.ofertaCheckoutPrice.createMany({ data: prices.map((price) => ({ ...price, ofertaId: id })) });
      } else {
        await tx.ofertaCheckout.create({ data: { ...input, prices: { create: prices } } });
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return { error: "Ya existe una oferta para estos dos productos." };
      if (error.code === "P2025") return { error: "La oferta ya no existe." };
    }
    throw error;
  }
  revalidatePath("/admin/order-bumps");
  revalidatePath("/checkout/[productId]", "page");
  redirect("/admin/order-bumps");
}

export async function disableOffer(formData: FormData): Promise<void> {
  await requireRole("ADMIN", "SUPERADMIN");
  const id = z.string().min(1).max(191).parse(formData.get("id"));
  await db.ofertaCheckout.update({ where: { id }, data: { activo: false } });
  revalidatePath("/admin/order-bumps");
  revalidatePath("/checkout/[productId]", "page");
}
