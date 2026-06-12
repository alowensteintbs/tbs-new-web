"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";
import { CATALOG_TAGS } from "@/lib/catalog";

/** Invalidate cached catalog data that depends on categories. */
function revalidateCategoryCaches() {
  revalidateTag(CATALOG_TAGS.categories, "max");
  revalidateTag(CATALOG_TAGS.products, "max"); // product listing filters by category
}

/** Slugify a name: lowercase, spaces→dashes, strip non url-safe chars. */
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

const categorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]*$/, "Solo minúsculas, números y guiones")
    .optional(),
  description: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .nullable(),
  visible: z.boolean().default(true),
});

export type CategoryFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    description: formData.get("description") ?? "",
    visible: formData.get("visible") === "on",
  });
}

export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireSession();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const slug = parsed.data.slug || slugify(parsed.data.name);

  const exists = await db.category.findUnique({ where: { slug }, select: { id: true } });
  if (exists) return { error: `Ya existe una categoría con el slug "${slug}".` };

  await db.category.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      visible: parsed.data.visible,
    },
  });
  revalidatePath("/admin/categories");
  revalidateCategoryCaches();
  redirect("/admin/categories");
}

export async function updateCategory(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireSession();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { error: "Categoría inválida." };

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const slug = parsed.data.slug || slugify(parsed.data.name);

  const clash = await db.category.findFirst({
    where: { slug, NOT: { id } },
    select: { id: true },
  });
  if (clash) return { error: `Ya existe otra categoría con el slug "${slug}".` };

  await db.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      visible: parsed.data.visible,
    },
  });
  revalidatePath("/admin/categories");
  revalidateCategoryCaches();
  redirect("/admin/categories");
}

export async function toggleCategory(id: string, visible: boolean): Promise<void> {
  await requireSession();
  await db.category.update({ where: { id }, data: { visible } });
  revalidatePath("/admin/categories");
  revalidateCategoryCaches();
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  await requireSession();
  // Products keep existing (categoryId is set to null via onDelete: SetNull).
  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidateCategoryCaches();
  return {};
}
