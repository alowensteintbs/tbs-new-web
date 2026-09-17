import "server-only";

import { access, readdir } from "node:fs/promises";
import path from "node:path";

const PRODUCTS_DIRECTORY = path.join(
  process.cwd(),
  "src",
  "app",
  "(public)",
  "products"
);

export type ProductLanding = {
  slug: string;
  label: string;
};

export async function getProductLandings(): Promise<ProductLanding[]> {
  const entries = await readdir(PRODUCTS_DIRECTORY, { withFileTypes: true });
  const slugs = await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isDirectory() &&
          !entry.name.startsWith("[") &&
          !entry.name.startsWith("_") &&
          !entry.name.startsWith("(")
      )
      .map(async (entry) => {
        try {
          await access(path.join(PRODUCTS_DIRECTORY, entry.name, "page.tsx"));
          return entry.name;
        } catch {
          return null;
        }
      })
  );

  return slugs
    .filter((slug): slug is string => slug !== null)
    .sort((a, b) => a.localeCompare(b, "es"))
    .map((slug) => ({ slug, label: slug }));
}

export async function isProductLandingSlug(value: string): Promise<boolean> {
  const landings = await getProductLandings();
  return landings.some((landing) => landing.slug === value);
}
