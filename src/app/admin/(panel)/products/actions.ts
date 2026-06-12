"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";
import { CATALOG_TAGS } from "@/lib/catalog";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(150),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]*$/, "Solo minúsculas, números y guiones")
    .optional(),
  sku: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .nullable(),
  description: z.string().max(5000).default(""),
  academyId: z.string().trim().min(1, "El ID academia es requerido").max(100),
  categoryId: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .nullable(),
  visible: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/** Reads "image_url[]" / "image_alt[]" fields into ordered image records. */
function parseImages(formData: FormData): { url: string; alt: string | null; position: number }[] {
  const urls = formData.getAll("image_url").map(String);
  const alts = formData.getAll("image_alt").map(String);
  return urls
    .map((url, i) => ({ url: url.trim(), alt: alts[i]?.trim() || null, position: i }))
    .filter((img) => img.url !== "");
}

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

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    sku: formData.get("sku") ?? "",
    description: formData.get("description") ?? "",
    academyId: formData.get("academyId"),
    categoryId: formData.get("categoryId") ?? "",
    visible: formData.get("visible") === "on",
    featured: formData.get("featured") === "on",
  });
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireSession();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { slug: rawSlug, ...rest } = parsed.data;
  const slug = rawSlug || slugify(parsed.data.name);

  const clash = await db.product.findUnique({ where: { slug }, select: { id: true } });
  if (clash) return { error: `Ya existe un producto con el slug "${slug}".` };

  const enabledIds = await getEnabledCurrencyIds();
  const result = parsePrices(formData, enabledIds);
  if ("error" in result) return { error: result.error };

  const images = parseImages(formData);

  await db.product.create({
    data: {
      ...rest,
      slug,
      prices: { create: result.prices },
      images: { create: images },
    },
  });

  revalidatePath("/admin/products");
  revalidateTag(CATALOG_TAGS.products, "max");
  redirect("/admin/products");
}

export async function updateProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireSession();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { error: "Producto inválido." };

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { slug: rawSlug, ...rest } = parsed.data;
  const slug = rawSlug || slugify(parsed.data.name);

  const clash = await db.product.findFirst({
    where: { slug, NOT: { id } },
    select: { id: true },
  });
  if (clash) return { error: `Ya existe otro producto con el slug "${slug}".` };

  const enabledIds = await getEnabledCurrencyIds();
  const result = parsePrices(formData, enabledIds);
  if ("error" in result) return { error: result.error };

  const images = parseImages(formData);

  // Replace prices and images atomically: both sets always reflect the form.
  await db.$transaction([
    db.product.update({ where: { id }, data: { ...rest, slug } }),
    db.productPrice.deleteMany({ where: { productId: id } }),
    db.productPrice.createMany({
      data: result.prices.map((p) => ({ ...p, productId: id })),
    }),
    db.productImage.deleteMany({ where: { productId: id } }),
    db.productImage.createMany({
      data: images.map((img) => ({ ...img, productId: id })),
    }),
  ]);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidateTag(CATALOG_TAGS.products, "max");
  redirect("/admin/products");
}

export async function deleteProduct(id: string): Promise<void> {
  await requireSession();
  await db.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidateTag(CATALOG_TAGS.products, "max");
}
