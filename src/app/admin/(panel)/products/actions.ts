"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(150),
  description: z.string().max(5000).default(""),
  academyId: z.string().trim().min(1, "El ID academia es requerido").max(100),
});

export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/** Reads "price_<currencyId>" fields from the form, validating each amount. */
function parsePrices(formData: FormData, enabledCurrencyIds: Set<string>) {
  const prices: { currencyId: string; amount: number }[] = [];

  for (const currencyId of enabledCurrencyIds) {
    const raw = formData.get(`price_${currencyId}`);
    if (typeof raw !== "string" || raw.trim() === "") continue;

    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount < 0) {
      return { error: `Precio inválido para una de las monedas.` as string };
    }
    prices.push({ currencyId, amount });
  }

  return { prices };
}

async function getEnabledCurrencyIds(): Promise<Set<string>> {
  const currencies = await db.currency.findMany({
    where: { enabled: true },
    select: { id: true },
  });
  return new Set(currencies.map((c) => c.id));
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireSession();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    academyId: formData.get("academyId"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const enabledIds = await getEnabledCurrencyIds();
  const result = parsePrices(formData, enabledIds);
  if ("error" in result) return { error: result.error };

  await db.product.create({
    data: {
      ...parsed.data,
      prices: { create: result.prices },
    },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireSession();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { error: "Producto inválido." };

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    academyId: formData.get("academyId"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const enabledIds = await getEnabledCurrencyIds();
  const result = parsePrices(formData, enabledIds);
  if ("error" in result) return { error: result.error };

  // Replace prices atomically: the product's price set always reflects the form.
  await db.$transaction([
    db.product.update({ where: { id }, data: parsed.data }),
    db.productPrice.deleteMany({ where: { productId: id } }),
    db.productPrice.createMany({
      data: result.prices.map((p) => ({ ...p, productId: id })),
    }),
  ]);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  redirect("/admin/products");
}

export async function deleteProduct(id: string): Promise<void> {
  await requireSession();
  await db.product.delete({ where: { id } });
  revalidatePath("/admin/products");
}
