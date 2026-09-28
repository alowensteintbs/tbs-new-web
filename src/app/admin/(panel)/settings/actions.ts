"use server";

import { z } from "zod";
import { updateTag } from "next/cache";
import { requireSession } from "@/lib/auth/dal";
import { setSetting, deleteSetting, SETTINGS_TAG } from "@/lib/settings";

/**
 * The public-site setting lives in the generic `SiteSetting` key/value table.
 * An empty value deletes it, which means that no GTM script is rendered.
 * Guarded by proxy.ts + this session check.
 */

// Empty is allowed (clears GTM); otherwise the container id is validated before
// it reaches the public page <head>.
const optionalId = (re: RegExp, msg: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || re.test(v), msg)
    .transform((v) => (v ? v : undefined));

const settingsSchema = z.object({
  gtm_id: optionalId(/^GTM-[A-Z0-9]+$/i, "Formato inválido (ej. GTM-ABC123)"),
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
    gtm_id: formData.get("gtm_id") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  if (parsed.data.gtm_id) await setSetting("gtm_id", parsed.data.gtm_id);
  else await deleteSetting("gtm_id");

  // This Server Action promises read-your-own-writes: the next public request
  // observes the saved GTM id immediately, rather than a stale cached setting.
  updateTag(SETTINGS_TAG);

  return { ok: true };
}
