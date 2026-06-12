import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { TableSearch } from "@/app/admin/_components/table-search";
import { Pagination } from "@/app/admin/_components/pagination";
import { getPagination, getTotalPages } from "@/lib/pagination";
import { CategoryTable } from "./_components/category-table";

export const metadata: Metadata = { title: "Categorías" };

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";

  const where: Prisma.CategoryWhereInput = q
    ? { OR: [{ name: { contains: q } }, { slug: { contains: q } }] }
    : {};

  const { page, skip, take } = getPagination(params);

  const [rows, total] = await db.$transaction([
    db.category.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        visible: true,
        _count: { select: { products: true } },
      },
      skip,
      take,
    }),
    db.category.count({ where }),
  ]);

  const totalPages = getTotalPages(total);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Categorías</h2>
          <p className="mt-1 text-sm text-gray-500">{total} categoría(s)</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
        >
          Nueva categoría
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <TableSearch placeholder="Buscar categoría…" />
      </div>

      <CategoryTable
        rows={rows.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          visible: r.visible,
          productCount: r._count.products,
        }))}
      />

      <Pagination page={page} totalPages={totalPages} searchParams={params} />
    </div>
  );
}
