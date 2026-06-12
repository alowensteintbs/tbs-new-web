import { env } from "@/lib/env";

/**
 * Bunny Storage helpers. Uploads/deletes files via the Storage API and returns
 * public CDN URLs. Requires BUNNY_STORAGE_ZONE, BUNNY_STORAGE_API_KEY,
 * BUNNY_STORAGE_HOST and BUNNY_CDN_URL to be configured.
 */

function getBunnyConfig() {
  const { BUNNY_STORAGE_ZONE, BUNNY_STORAGE_API_KEY, BUNNY_STORAGE_HOST, BUNNY_CDN_URL } = env;
  if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_API_KEY || !BUNNY_STORAGE_HOST || !BUNNY_CDN_URL) {
    throw new Error(
      "Bunny Storage no está configurado. Definí BUNNY_STORAGE_ZONE, BUNNY_STORAGE_API_KEY, BUNNY_STORAGE_HOST y BUNNY_CDN_URL en .env."
    );
  }
  return { BUNNY_STORAGE_ZONE, BUNNY_STORAGE_API_KEY, BUNNY_STORAGE_HOST, BUNNY_CDN_URL };
}

export function isBunnyConfigured(): boolean {
  return Boolean(
    env.BUNNY_STORAGE_ZONE &&
      env.BUNNY_STORAGE_API_KEY &&
      env.BUNNY_STORAGE_HOST &&
      env.BUNNY_CDN_URL
  );
}

/** Build a unique storage path for an upload, preserving the file extension. */
export function buildStoragePath(originalName: string, prefix = "products"): string {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "bin";
  return `${prefix}/${crypto.randomUUID()}.${ext}`;
}

/** Upload a file to Bunny Storage. Returns the public CDN URL. */
export async function uploadToBunny(
  data: ArrayBuffer | Uint8Array,
  path: string,
  contentType: string
): Promise<{ url: string; path: string }> {
  const cfg = getBunnyConfig();
  const res = await fetch(
    `https://${cfg.BUNNY_STORAGE_HOST}/${cfg.BUNNY_STORAGE_ZONE}/${path}`,
    {
      method: "PUT",
      headers: {
        AccessKey: cfg.BUNNY_STORAGE_API_KEY,
        "Content-Type": contentType,
      },
      body: data as BodyInit,
    }
  );
  if (!res.ok) {
    throw new Error(`Bunny upload falló (${res.status}): ${await res.text()}`);
  }
  return { url: `${cfg.BUNNY_CDN_URL}/${path}`, path };
}

/** Delete a file from Bunny Storage by its storage path. */
export async function deleteFromBunny(path: string): Promise<void> {
  const cfg = getBunnyConfig();
  await fetch(
    `https://${cfg.BUNNY_STORAGE_HOST}/${cfg.BUNNY_STORAGE_ZONE}/${path}`,
    { method: "DELETE", headers: { AccessKey: cfg.BUNNY_STORAGE_API_KEY } }
  );
}
