"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";

const redirectSchema = z.object({
  from: z
    .string()
    .trim()
    .startsWith("/", "Debe empezar con / (ej. /pagina-vieja)"),
  to: z
    .string()
    .trim()
    .min(1, "El destino es requerido")
    .refine((v) => v.startsWith("/") || v.startsWith("http"), {
      message: "Usa una ruta (/nueva) o una URL absoluta (https://...)",
    }),
  statusCode: z.coerce.number().int().refine((v) => v === 301 || v === 302, {
    message: "El código debe ser 301 o 302",
  }),
  enabled: z.boolean().default(true),
});

export type RedirectFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseForm(formData: FormData) {
  return redirectSchema.safeParse({
    from: formData.get("from"),
    to: formData.get("to"),
    statusCode: formData.get("statusCode"),
    enabled: formData.get("enabled") === "on",
  });
}

export async function createRedirect(
  _prev: RedirectFormState,
  formData: FormData
): Promise<RedirectFormState> {
  await requireSession();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const exists = await db.redirect.findUnique({
    where: { from: parsed.data.from },
    select: { id: true },
  });
  if (exists) return { error: `Ya existe una redirección desde ${parsed.data.from}.` };

  await db.redirect.create({ data: parsed.data });
  revalidatePath("/admin/redirects");
  redirect("/admin/redirects");
}

export async function updateRedirect(
  _prev: RedirectFormState,
  formData: FormData
): Promise<RedirectFormState> {
  await requireSession();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { error: "Redirección inválida." };

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const clash = await db.redirect.findFirst({
    where: { from: parsed.data.from, NOT: { id } },
    select: { id: true },
  });
  if (clash) return { error: `Ya existe otra redirección desde ${parsed.data.from}.` };

  await db.redirect.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/redirects");
  redirect("/admin/redirects");
}

export async function toggleRedirect(id: string, enabled: boolean): Promise<void> {
  await requireSession();
  await db.redirect.update({ where: { id }, data: { enabled } });
  revalidatePath("/admin/redirects");
}

export async function deleteRedirect(id: string): Promise<{ error?: string }> {
  await requireSession();
  await db.redirect.delete({ where: { id } });
  revalidatePath("/admin/redirects");
  return {};
}
