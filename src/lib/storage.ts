import "server-only";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

/**
 * Local disk storage for admin uploads (product images). Files are written
 * under `public/uploads/` and served statically by Next at `/uploads/...`.
 *
 * This assumes a host with a persistent disk (VPS / mounted volume) and a
 * single instance — the same model as WordPress' wp-content/uploads. If TBS
 * ever moves to serverless (read-only FS), swap this module for an object
 * store (Bunny/R2/Blob); the upload route's contract (returns a public `url`)
 * stays the same.
 */

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads";

/** Build a unique storage path for an upload, preserving the extension. */
export function buildStoragePath(originalName: string, prefix = "products"): string {
  const ext = originalName.includes(".")
    ? originalName.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")
    : "bin";
  return `${prefix}/${crypto.randomUUID()}.${ext || "bin"}`;
}

/** Persist an upload to disk. Returns its public URL and storage path. */
export async function saveUpload(
  data: ArrayBuffer | Uint8Array,
  storagePath: string,
  _contentType: string
): Promise<{ url: string; path: string }> {
  const abs = path.join(UPLOAD_ROOT, storagePath);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, Buffer.from(data as ArrayBuffer));
  return { url: `${PUBLIC_PREFIX}/${storagePath}`, path: storagePath };
}

/** Delete an upload by its storage path or public URL. Best-effort. */
export async function deleteUpload(pathOrUrl: string): Promise<void> {
  const rel = pathOrUrl.replace(/^\/uploads\//, "").replace(/^\/+/, "");
  const abs = path.resolve(UPLOAD_ROOT, rel);
  // Guard against path traversal — never touch anything outside the root.
  if (abs !== UPLOAD_ROOT && !abs.startsWith(UPLOAD_ROOT + path.sep)) return;
  await unlink(abs).catch(() => {});
}
