import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { TableSearch } from "@/app/admin/_components/table-search";
import { StatusFilter } from "@/app/admin/_components/status-filter";
import type { SortDir } from "@/app/admin/_components/sortable-header";
import { Pagination } from "@/app/admin/_components/pagination";
import { getPagination, getTotalPages } from "@/lib/pagination";
import { CurrencyTable } from "./_components/currency-table";

export const metadata: Metadata = { title: "Monedas" };

const SORTABLE = { code: "code", name: "name" } as const;

const STATUS_OPTIONS = [
  { value: "", label: "Todas" },
  { value: "enabled", label: "Habilitadas" },
  { value: "disabled", label: "Deshabilitadas" },
];

export default async function CurrenciesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status ?? "";
  const sort = (params.sort && params.sort in SORTABLE ? params.sort : "code") as keyof typeof SORTABLE;
  const dir: SortDir = params.dir === "desc" ? "desc" : "asc";

  const where: Prisma.CurrencyWhereInput = {
    ...(q && { OR: [{ code: { contains: q } }, { name: { contains: q } }] }),
    ...(status === "enabled" && { enabled: true }),
    ...(status === "disabled" && { enabled: false }),
  };

  const { page, skip, take } = getPagination(params);

  const [rows, total] = await db.$transaction([
    db.currency.findMany({
      where,
      orderBy: { [sort]: dir },
      select: { id: true, code: true, name: true, symbol: true, enabled: true },
      skip,
      take,
    }),
    db.currency.count({ where }),
  ]);

  const totalPages = getTotalPages(total);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Monedas</h2>
          <p className="mt-1 text-sm text-gray-500">{total} moneda(s)</p>
        </div>
        <Link
          href="/admin/currencies/new"
          className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
        >
          Nueva moneda
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <TableSearch placeholder="Buscar moneda…" />
        <StatusFilter options={STATUS_OPTIONS} />
      </div>

      <CurrencyTable rows={rows} sort={sort} dir={dir} searchParams={params} />

      <Pagination page={page} totalPages={totalPages} searchParams={params} />
    </div>
  );
}
