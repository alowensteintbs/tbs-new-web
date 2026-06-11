import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { TableSearch } from "@/app/admin/_components/table-search";
import type { SortDir } from "@/app/admin/_components/sortable-header";
import { Pagination } from "@/app/admin/_components/pagination";
import { getPagination, getTotalPages } from "@/lib/pagination";
import { ProductTable, type ProductRow } from "./_components/product-table";

export const metadata: Metadata = { title: "Productos" };

const SORTABLE = { name: "name", updatedAt: "updatedAt" } as const;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const sort = (params.sort && params.sort in SORTABLE ? params.sort : "updatedAt") as keyof typeof SORTABLE;
  const dir: SortDir = params.dir === "asc" ? "asc" : "desc";

  const where: Prisma.ProductWhereInput = q ? { name: { contains: q } } : {};
  const { page, skip, take } = getPagination(params);

  const [products, total] = await db.$transaction([
    db.product.findMany({
      where,
      orderBy: { [sort]: dir },
      include: { prices: { include: { currency: true } } },
      skip,
      take,
    }),
    db.product.count({ where }),
  ]);

  const totalPages = getTotalPages(total);

  const rows: ProductRow[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    prices: product.prices.map((price) => ({
      code: price.currency.code,
      symbol: price.currency.symbol,
      amount: price.amount.toString(),
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Productos</h2>
          <p className="mt-1 text-sm text-gray-500">{total} producto(s)</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
        >
          Nuevo producto
        </Link>
      </div>

      <TableSearch placeholder="Buscar producto…" />

      <ProductTable rows={rows} sort={sort} dir={dir} searchParams={params} />

      <Pagination page={page} totalPages={totalPages} searchParams={params} />
    </div>
  );
}
