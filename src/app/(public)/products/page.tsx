import type { Metadata } from "next";
import Link from "next/link";
import { getActiveCurrency } from "@/lib/currency-resolver";
import { getVisibleProducts, getVisibleCategories } from "@/lib/catalog";
import { getPagination, getTotalPages } from "@/lib/pagination";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/catalog/product-card";
import { Pagination } from "@/app/admin/_components/pagination";

export const metadata: Metadata = {
  title: "Productos",
  description: "Catálogo de productos de Traders Business School.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const categorySlug = params.category?.trim() ?? "";
  const { page, skip, take } = getPagination(params);

  // Active currency reads the country cookie (dynamic) but resolves against the
  // cached currency list; product data below is served from cache per currency.
  const currency = await getActiveCurrency();

  const [{ products, total }, categories] = await Promise.all([
    getVisibleProducts({
      currencyId: currency?.id ?? null,
      q,
      categorySlug,
      skip,
      take,
    }),
    getVisibleCategories(),
  ]);

  const totalPages = getTotalPages(total);

  return (
    <Container className="py-12">
      <h1 className="text-2xl font-bold text-gray-900">Productos</h1>

      {categories.length > 0 && (
        <nav className="mt-6 flex flex-wrap gap-2">
          <CategoryChip href="/products" active={!categorySlug} label="Todos" />
          {categories.map((c) => (
            <CategoryChip
              key={c.slug}
              href={`/products?category=${c.slug}`}
              active={categorySlug === c.slug}
              label={c.name}
            />
          ))}
        </nav>
      )}

      {products.length === 0 ? (
        <p className="mt-10 text-sm text-gray-500">No hay productos disponibles.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.slug}
              product={{
                slug: p.slug,
                name: p.name,
                imageUrl: p.imageUrl,
                amount: p.amount,
                currencyCode: currency?.code ?? null,
              }}
            />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination page={page} totalPages={totalPages} searchParams={params} />
      </div>
    </Container>
  );
}

function CategoryChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-gray-900 px-3 py-1.5 text-sm text-white"
          : "rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
      }
    >
      {label}
    </Link>
  );
}
