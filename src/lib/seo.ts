import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";

type SeoPage = {
  name: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  canonical: string | null;
  noindex: boolean;
};

/** Build a Next.js Metadata object from a Page's SEO fields. */
export function buildPageMetadata(page: SeoPage): Metadata {
  const title = page.metaTitle ?? page.name;
  const description = page.metaDescription ?? undefined;
  const canonical = page.canonical ?? `${getSiteUrl()}/${page.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: page.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      images: page.ogImage ? [{ url: page.ogImage }] : undefined,
    },
  };
}
