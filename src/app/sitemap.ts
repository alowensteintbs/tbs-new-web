import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const pages = await db.page.findMany({
    where: { status: "PUBLISHED", noindex: false },
    select: { slug: true, updatedAt: true },
  });

  return pages.map((page) => ({
    url: `${base}/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}
