import type { Metadata } from "next";
import Link from "next/link";
import { getActiveCurrency } from "@/lib/currency-resolver";
import { getVisibleProducts, getVisibleCategories } from "@/lib/catalog";
import { getPagination, getTotalPages } from "@/lib/pagination";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/catalog/product-card";
import { Pagination } from "@/app/admin/_components/pagination";
import { cn } from "@/lib/utils";

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
    <Container className="py-12 sm:py-16">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          Catálogo
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Productos
        </h1>
        <p className="max-w-2xl text-sm text-gray-500 sm:text-base">
          Explora los cursos y programas de Traders Business School para potenciar tu
          operativa en los mercados.
        </p>
      </div>

      {categories.length > 0 && (
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Categorías">
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
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-20 text-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-12 w-12 text-gray-300"
            aria-hidden="true"
          >
            <path d="M6 7h12l1 13.5a1 1 0 0 1-1 1.5H6a1 1 0 0 1-1-1.5L6 7Z" />
            <path d="M9 10V6a3 3 0 0 1 6 0v4" />
          </svg>
          <p className="mt-4 text-sm font-medium text-gray-900">
            No hay productos disponibles
          </p>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Todavía no cargamos productos en esta categoría. Vuelve a intentarlo más
            tarde o prueba con otra categoría.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
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

      <div className="mt-12">
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
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        active
          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
          : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
      )}
    >
      {label}
    </Link>
  );
}
