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

type SeoProduct = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
};

/** Build a Next.js Metadata object for a product detail page. */
export function buildProductMetadata(product: SeoProduct): Metadata {
  const description = product.description.slice(0, 160) || undefined;
  const canonical = `${getSiteUrl()}/products/${product.slug}`;
  return {
    title: product.name,
    description,
    alternates: { canonical },
    openGraph: {
      title: product.name,
      description,
      url: canonical,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

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
