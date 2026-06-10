import { promises as fs } from "node:fs";
import path from "node:path";

const PAGES_DIR = path.join(process.cwd(), "src", "generated", "pages");

function slugPath(slug: string): string {
  return path.join(PAGES_DIR, `${slug}.tsx`);
}

export async function writePageFile(slug: string, code: string): Promise<void> {
  await fs.mkdir(PAGES_DIR, { recursive: true });
  await fs.writeFile(slugPath(slug), code, "utf8");
}

export async function readPageFile(slug: string): Promise<string | null> {
  try {
    return await fs.readFile(slugPath(slug), "utf8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

export async function deletePageFile(slug: string): Promise<void> {
  try {
    await fs.unlink(slugPath(slug));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
}

export async function renamePageFile(oldSlug: string, newSlug: string): Promise<void> {
  if (oldSlug === newSlug) return;
  try {
    await fs.mkdir(PAGES_DIR, { recursive: true });
    await fs.rename(slugPath(oldSlug), slugPath(newSlug));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
}
