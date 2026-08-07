import { unstable_cache, revalidateTag } from "next/cache";
import { db } from "@/lib/db";

/**
 * Well-known SiteSetting keys. Keep the list explicit so callers get
 * autocomplete and we avoid typos across the codebase.
 */
export type SettingKey =
  | "site_name"
  | "default_currency"
  | "gtm_id" // Google Tag Manager container (GTM-XXXXXX)
  | "ga_id" // Google Analytics 4 measurement id (G-XXXXXXX)
  | "hubspot_id" // HubSpot portal/hub id (numeric)
  | "facebook_pixel_id"; // Meta Pixel id (numeric)

export const SETTINGS_TAG = "site-settings";

/** All settings as a key→value map (cached; invalidated by SETTINGS_TAG). */
export const getSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const rows = await db.siteSetting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },
  ["site-settings"],
  { tags: [SETTINGS_TAG] }
);

/** Read a single setting, or `undefined` if not set. */
export async function getSetting(key: SettingKey): Promise<string | undefined> {
  const settings = await getSettings();
  return settings[key];
}

/** Upsert a setting value. */
export async function setSetting(key: SettingKey, value: string): Promise<void> {
  await db.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  revalidateTag(SETTINGS_TAG, "max");
}

/**
 * Remove a setting entirely. Prefer this over storing "" when clearing a value:
 * an absent key lets callers fall back to their env-var default (see the public
 * layout), whereas an empty string would override that fallback with "disabled".
 */
export async function deleteSetting(key: SettingKey): Promise<void> {
  await db.siteSetting.deleteMany({ where: { key } });
  revalidateTag(SETTINGS_TAG, "max");
}
