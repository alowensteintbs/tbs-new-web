import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { rutasClasesGratis } from "@/lib/clases-gratis";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  let products: { landingSlug: string; updatedAt: Date }[] = [];

  if (process.env.DATABASE_URL) {
    try {
      const { getVisibleProductLandings } = await import("@/lib/catalog");
      products = await getVisibleProductLandings();
    } catch (error) {
      // El sitemap estático no debe bloquear un deploy por una caída temporal
      // de la base. Las rutas conocidas siguen publicándose y se reintenta en
      // el próximo build.
      console.error("No se pudieron cargar productos para el sitemap", error);
    }
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
    ...products.map((product) => ({
      url: `${base}/products/${product.landingSlug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
