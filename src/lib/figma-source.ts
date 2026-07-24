import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * On-disk cache of the Figma *source* for each generated page.
 *
 * Purpose: avoid re-hitting the Figma API on every regeneration. We persist the
 * raw node tree plus the exported-asset manifest, keyed by the file `version`.
 * If the design hasn't changed since last time, the page can be re-emitted
 * without a single image render (the expensive, rate-limited Figma endpoint).
 *
 * Stored under `.figma-cache/` (git-ignored, NOT under `public/` — the node
 * tree should not be web-accessible).
 */

const CACHE_DIR = path.join(process.cwd(), ".figma-cache");

/** Maps a Figma node id → the public URL of its exported asset. */
export type AssetManifest = Record<string, string>;

export type FigmaSourceCache = {
  /** Figma file `version` (or `lastModified`) — changes on any edit. */
  version: string;
  fileKey: string;
  nodeId: string;
  /** The raw `GET /v1/files/{key}/nodes` response. */
  figmaJson: unknown;
  assets: AssetManifest;
  savedAt: string;
};

function cacheFile(slug: string): string {
  return path.join(CACHE_DIR, `${slug}.json`);
}

export async function readSourceCache(slug: string): Promise<FigmaSourceCache | null> {
  try {
    const raw = await fs.readFile(cacheFile(slug), "utf8");
    return JSON.parse(raw) as FigmaSourceCache;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

export async function writeSourceCache(slug: string, cache: FigmaSourceCache): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(cacheFile(slug), JSON.stringify(cache), "utf8");
}

export async function deleteSourceCache(slug: string): Promise<void> {
  try {
    await fs.unlink(cacheFile(slug));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
}
