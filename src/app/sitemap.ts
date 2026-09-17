import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { rutasClasesGratis } from "@/lib/clases-gratis";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  let pages: { slug: string; updatedAt: Date }[] = [];
  let products: { slug: string; updatedAt: Date }[] = [];

  if (process.env.DATABASE_URL) {
    const [{ db }, { getVisibleProductSlugs }] = await Promise.all([
      import("@/lib/db"),
      import("@/lib/catalog"),
    ]);
    [pages, products] = await Promise.all([
      db.page.findMany({
        where: { status: "PUBLISHED", noindex: false },
        select: { slug: true, updatedAt: true },
      }),
      getVisibleProductSlugs(),
    ]);
  }

  return [
    {
      url: `${base}/guias-gratis`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${base}/plataforma-ia`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...rutasClasesGratis.map((route, index) => ({
      url: `${base}${route}`,
      changeFrequency: "weekly" as const,
      priority: index === 0 ? 0.8 : 0.7,
    })),
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
