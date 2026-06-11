"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";
import { deletePageFile, renamePageFile } from "@/lib/page-files";

const pageSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  slug: z
    .string()
    .min(1, "El slug es requerido")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  figmaFileKey: z.string().min(1, "La Figma file key es requerida"),
  figmaNodeId: z.string().min(1, "El Figma node ID es requerido"),
});

const updatePageSchema = pageSchema.extend({
  id: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type PageFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createPage(
  _prev: PageFormState,
  formData: FormData
): Promise<PageFormState> {
  await requireSession();
  const parsed = pageSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    figmaFileKey: formData.get("figmaFileKey"),
    figmaNodeId: formData.get("figmaNodeId"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const page = await db.page.create({ data: parsed.data });
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${page.id}`);
}

export async function updatePage(
  _prev: PageFormState,
  formData: FormData
): Promise<PageFormState> {
  await requireSession();
  const parsed = updatePageSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    figmaFileKey: formData.get("figmaFileKey"),
    figmaNodeId: formData.get("figmaNodeId"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { id, ...data } = parsed.data;
  const previous = await db.page.findUnique({
    where: { id },
    select: { slug: true },
  });
  await db.page.update({ where: { id }, data });
  if (previous && previous.slug !== data.slug) {
    await renamePageFile(previous.slug, data.slug);
    revalidatePath(`/${previous.slug}`);
    revalidatePath(`/${data.slug}`);
  }
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${id}`);
  return {};
}

export async function deletePage(id: string): Promise<void> {
  await requireSession();
  const page = await db.page.findUnique({
    where: { id },
    select: { slug: true },
  });
  await db.page.delete({ where: { id } });
  if (page) {
    await deletePageFile(page.slug);
    revalidatePath(`/${page.slug}`);
  }
  revalidatePath("/admin/pages");
}
