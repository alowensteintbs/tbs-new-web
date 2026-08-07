"use server";

import { z } from "zod";
import { requireSession } from "@/lib/auth/dal";
import { setSetting, deleteSetting, type SettingKey } from "@/lib/settings";

/**
 * Site settings live in the generic `SiteSetting` key/value table. This action
 * validates the well-known keys and writes each one: a non-empty value is
 * upserted, a blank value deletes the key (so the env-var fallback in the
 * public layout can take over again). Guarded by proxy.ts + this session check.
 */

// Each field: optional and trimmed. Empty is allowed (clears the setting);
// otherwise it must match the provider's id format so a pasted-wrong value is
// caught before it reaches the page <head>. Empty → undefined for the writer.
const optionalId = (re: RegExp, msg: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || re.test(v), msg)
    .transform((v) => (v ? v : undefined));

const settingsSchema = z.object({
  site_name: z
    .string()
    .trim()
    .max(120)
    .transform((v) => (v ? v : undefined)),
  gtm_id: optionalId(/^GTM-[A-Z0-9]+$/i, "Formato inválido (ej. GTM-ABC123)"),
  ga_id: optionalId(/^G-[A-Z0-9]+$/i, "Formato inválido (ej. G-XXXXXXX)"),
  hubspot_id: optionalId(/^\d+$/, "El ID de HubSpot es numérico"),
  facebook_pixel_id: optionalId(/^\d+$/, "El ID del píxel es numérico"),
});

export type SettingsFormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateSettings(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireSession();

  const parsed = settingsSchema.safeParse({
    site_name: formData.get("site_name") ?? "",
    gtm_id: formData.get("gtm_id") ?? "",
    ga_id: formData.get("ga_id") ?? "",
    hubspot_id: formData.get("hubspot_id") ?? "",
    facebook_pixel_id: formData.get("facebook_pixel_id") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  // Write every known key: set when present, delete when cleared.
  const entries = Object.entries(parsed.data) as [SettingKey, string | undefined][];
  for (const [key, value] of entries) {
    if (value) await setSetting(key, value);
    else await deleteSetting(key);
  }

  return { ok: true };
}
