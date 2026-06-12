import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/env";
import { getVisibleProductSlugs } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [pages, products] = await Promise.all([
    db.page.findMany({
      where: { status: "PUBLISHED", noindex: false },
      select: { slug: true, updatedAt: true },
    }),
    getVisibleProductSlugs(),
  ]);

  return [
    ...pages.map((page) => ({
      url: `${base}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
