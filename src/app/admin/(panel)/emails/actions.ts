"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";
import { encrypt, decrypt } from "@/lib/crypto";
import { getTemplateDef } from "@/lib/email/templates";

export type EmailFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  ok?: boolean;
};

/* ---------------------------- Transport settings --------------------------- */

const settingsSchema = z.object({
  fromEmail: z.email("Email de remitente inválido").or(z.literal("")),
  fromName: z.string().max(120).optional().default(""),
});

/** Decrypt the stored Resend API key (empty string if unset/unreadable). */
function readApiKey(config: string | undefined): string {
  if (!config) return "";
  try {
    return (JSON.parse(decrypt(config)) as { apiKey?: string }).apiKey ?? "";
  } catch {
    return "";
  }
}

export async function updateEmailSettings(
  _prev: EmailFormState,
  formData: FormData
): Promise<EmailFormState> {
  await requireSession();

  const parsed = settingsSchema.safeParse({
    fromEmail: String(formData.get("fromEmail") ?? ""),
    fromName: String(formData.get("fromName") ?? ""),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const existing = await db.emailSettings.findUnique({
    where: { id: "singleton" },
  });

  // Blank-on-edit: keep the stored key when the field is left empty.
  const submittedKey = String(formData.get("apiKey") ?? "").trim();
  const apiKey = submittedKey || readApiKey(existing?.config);
  const config = encrypt(JSON.stringify({ apiKey }));

  await db.emailSettings.upsert({
    where: { id: "singleton" },
    update: {
      fromEmail: parsed.data.fromEmail,
      fromName: parsed.data.fromName,
      config,
    },
    create: {
      id: "singleton",
      fromEmail: parsed.data.fromEmail,
      fromName: parsed.data.fromName,
      config,
    },
  });

  revalidatePath("/admin/emails");
  return { ok: true };
}

/* -------------------------------- Templates -------------------------------- */

const templateSchema = z.object({
  key: z.string().min(1),
  subject: z.string().min(1, "El asunto es obligatorio").max(200),
  html: z.string().min(1, "El contenido HTML es obligatorio"),
});

/** Toggle a template on/off, materializing catalog defaults on first write. */
export async function toggleTemplate(
  key: string,
  enabled: boolean
): Promise<void> {
  await requireSession();
  const def = getTemplateDef(key);
  if (!def) return;

  await db.emailTemplate.upsert({
    where: { key },
    update: { enabled },
    create: {
      key,
      enabled,
      subject: def.defaultSubject,
      html: def.defaultHtml,
    },
  });
  revalidatePath("/admin/emails");
}

export async function updateTemplate(
  _prev: EmailFormState,
  formData: FormData
): Promise<EmailFormState> {
  await requireSession();

  const parsed = templateSchema.safeParse({
    key: String(formData.get("key") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    html: String(formData.get("html") ?? ""),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { key, subject, html } = parsed.data;
  if (!getTemplateDef(key)) return { error: "Plantilla desconocida" };

  await db.emailTemplate.upsert({
    where: { key },
    update: { subject, html },
    create: { key, subject, html, enabled: false },
  });

  revalidatePath("/admin/emails");
  redirect("/admin/emails");
}

/** Restore a template's subject/HTML to the catalog default. */
export async function resetTemplate(key: string): Promise<void> {
  await requireSession();
  const def = getTemplateDef(key);
  if (!def) return;
  await db.emailTemplate.upsert({
    where: { key },
    update: { subject: def.defaultSubject, html: def.defaultHtml },
    create: {
      key,
      enabled: false,
      subject: def.defaultSubject,
      html: def.defaultHtml,
    },
  });
  revalidatePath(`/admin/emails/${key}`);
  revalidatePath("/admin/emails");
}
