import { cache } from "react";
import { db } from "@/lib/db";

/**
 * Well-known SiteSetting keys. Keep the list explicit so callers get
 * autocomplete and we avoid typos across the codebase.
 */
export type SettingKey = "gtm_id" | "default_currency" | "site_name";

/** All settings as a key→value map, cached per request. */
export const getSettings = cache(async (): Promise<Record<string, string>> => {
  const rows = await db.siteSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});

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
}
