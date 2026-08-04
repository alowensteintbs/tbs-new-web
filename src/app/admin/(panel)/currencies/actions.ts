"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";
import { CATALOG_TAGS } from "@/lib/catalog";

/** Invalidate cached data that depends on currencies (resolution + pricing). */
function revalidateCurrencyCaches() {
  revalidateTag(CATALOG_TAGS.currencies, "max");
  revalidateTag(CATALOG_TAGS.products, "max"); // catalog prices depend on currency
}

const currencySchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/, "Usa el código ISO de 3 letras (ej. EUR)"),
  name: z.string().min(1, "El nombre es requerido").max(60),
  symbol: z.string().min(1, "El símbolo es requerido").max(8),
  enabled: z.boolean().default(true),
  // CSV of ISO-3166 alpha-2 country codes, normalized to uppercase.
  countryCodes: z
    .string()
    .trim()
    .transform((v) =>
      v
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean)
        .join(",")
    )
    .default(""),
});

export type CurrencyFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseForm(formData: FormData) {
  return currencySchema.safeParse({
    code: String(formData.get("code") ?? "").toUpperCase(),
    name: formData.get("name"),
    symbol: formData.get("symbol"),
    enabled: formData.get("enabled") === "on",
    countryCodes: formData.get("countryCodes") ?? "",
  });
}

export async function createCurrency(
  _prev: CurrencyFormState,
  formData: FormData
): Promise<CurrencyFormState> {
  await requireSession();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const exists = await db.currency.findUnique({
    where: { code: parsed.data.code },
    select: { id: true },
  });
  if (exists) return { error: `La moneda ${parsed.data.code} ya existe.` };

  await db.currency.create({ data: parsed.data });
  revalidatePath("/admin/currencies");
  revalidateCurrencyCaches();
  redirect("/admin/currencies");
}

export async function updateCurrency(
  _prev: CurrencyFormState,
  formData: FormData
): Promise<CurrencyFormState> {
  await requireSession();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { error: "Moneda inválida." };

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const clash = await db.currency.findFirst({
    where: { code: parsed.data.code, NOT: { id } },
    select: { id: true },
  });
  if (clash) return { error: `Ya existe otra moneda con el código ${parsed.data.code}.` };

  await db.currency.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/currencies");
  revalidateCurrencyCaches();
  redirect("/admin/currencies");
}

/** Quick enable/disable toggle from the list, without opening the form. */
export async function toggleCurrency(id: string, enabled: boolean): Promise<void> {
  await requireSession();
  await db.currency.update({ where: { id }, data: { enabled } });
  revalidatePath("/admin/currencies");
  revalidateCurrencyCaches();
}

export async function deleteCurrency(id: string): Promise<{ error?: string }> {
  await requireSession();

  // Block deletion if any product already has a price in this currency:
  // removing it would silently drop those prices (onDelete: Cascade).
  const priceCount = await db.productPrice.count({ where: { currencyId: id } });
  if (priceCount > 0) {
    return {
      error: "No se puede eliminar: hay productos con precios en esta moneda. Deshabilitala en su lugar.",
    };
  }

  await db.currency.delete({ where: { id } });
  revalidatePath("/admin/currencies");
  revalidateCurrencyCaches();
  return {};
}
