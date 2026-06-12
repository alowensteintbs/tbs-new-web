import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

/**
 * Cached catalog data access. Wrapping the DB reads in `unstable_cache` keeps
 * the public catalog from hitting the DB on every request. Country/currency are
 * passed as ARGUMENTS (read from the cookie outside these helpers) so each
 * currency gets its own cache entry.
 *
 * Cache tags allow on-demand invalidation from the admin server actions:
 *   - "products"   → product list/detail
 *   - "categories" → category nav
 *   - "currencies" → currency resolution
 */

export const CATALOG_TAGS = {
  products: "products",
  categories: "categories",
  currencies: "currencies",
} as const;

export type CatalogCurrency = {
  id: string;
  code: string;
  name: string;
  symbol: string;
  countryCodes: string;
};

/** All enabled currencies (cached). Country→currency is resolved by the caller. */
export const getEnabledCurrencies = unstable_cache(
  async (): Promise<CatalogCurrency[]> =>
    db.currency.findMany({
      where: { enabled: true },
      select: { id: true, code: true, name: true, symbol: true, countryCodes: true },
    }),
  ["catalog-currencies"],
  { tags: [CATALOG_TAGS.currencies] }
);

/** Visible categories for the public nav (cached). */
export const getVisibleCategories = unstable_cache(
  async () =>
    db.category.findMany({
      where: { visible: true },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
  ["catalog-categories"],
  { tags: [CATALOG_TAGS.categories] }
);

export type CatalogProduct = {
  slug: string;
  name: string;
  imageUrl: string | null;
  amount: number | null;
};

/**
 * Visible products for the listing, priced in `currencyId` (cached per
 * currency + filters). Pass currencyId from the resolved active currency.
 */
export const getVisibleProducts = unstable_cache(
  async (opts: {
    currencyId: string | null;
    q?: string;
    categorySlug?: string;
    skip: number;
    take: number;
  }): Promise<{ products: CatalogProduct[]; total: number }> => {
    const where = {
      visible: true,
      ...(opts.q && { name: { contains: opts.q } }),
      ...(opts.categorySlug && {
        category: { slug: opts.categorySlug, visible: true },
      }),
    };

    const [rows, total] = await db.$transaction([
      db.product.findMany({
        where,
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
        select: {
          slug: true,
          name: true,
          images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
          prices: opts.currencyId
            ? { where: { currencyId: opts.currencyId }, select: { amount: true } }
            : false,
        },
        skip: opts.skip,
        take: opts.take,
      }),
      db.product.count({ where }),
    ]);

    const products = rows.map((p) => ({
      slug: p.slug,
      name: p.name,
      imageUrl: p.images[0]?.url ?? null,
      amount: p.prices?.[0] ? Number(p.prices[0].amount) : null,
    }));
    return { products, total };
  },
  ["catalog-products"],
  { tags: [CATALOG_TAGS.products] }
);

/** Single visible product by slug, priced in `currencyId` (cached). */
export const getProductDetail = unstable_cache(
  async (slug: string, currencyId: string | null) => {
    const product = await db.product.findUnique({
      where: { slug },
      select: {
        name: true,
        description: true,
        visible: true,
        category: { select: { name: true, slug: true, visible: true } },
        images: { orderBy: { position: "asc" }, select: { url: true, alt: true } },
        prices: currencyId
          ? { where: { currencyId }, select: { amount: true } }
          : false,
      },
    });

    if (!product || !product.visible) return null;
    return {
      name: product.name,
      description: product.description,
      category: product.category,
      images: product.images,
      amount: product.prices?.[0] ? Number(product.prices[0].amount) : null,
    };
  },
  ["catalog-product-detail"],
  { tags: [CATALOG_TAGS.products] }
);

/** Slugs of visible products, for sitemap (cached). */
export const getVisibleProductSlugs = unstable_cache(
  async () =>
    db.product.findMany({
      where: { visible: true },
      select: { slug: true, updatedAt: true },
    }),
  ["catalog-product-slugs"],
  { tags: [CATALOG_TAGS.products] }
);
