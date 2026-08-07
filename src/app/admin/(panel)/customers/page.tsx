import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { TableSearch } from "@/app/admin/_components/table-search";
import type { SortDir } from "@/app/admin/_components/sortable-header";
import { Pagination } from "@/app/admin/_components/pagination";
import { getPagination, getTotalPages } from "@/lib/pagination";
import { CustomerTable } from "./_components/customer-table";

export const metadata: Metadata = { title: "Clientes" };

const SORTABLE = { name: "name", email: "email", createdAt: "createdAt" } as const;

const dateFmt = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const sort = (params.sort && params.sort in SORTABLE ? params.sort : "createdAt") as keyof typeof SORTABLE;
  const dir: SortDir = params.dir === "asc" ? "asc" : "desc";

  const where: Prisma.CustomerWhereInput = q
    ? {
        OR: [
          { name: { contains: q } },
          { surname: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
        ],
      }
    : {};

  const { page, skip, take } = getPagination(params);

  const [rows, total] = await db.$transaction([
    db.customer.findMany({
      where,
      orderBy: { [sort]: dir },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
        country: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      skip,
      take,
    }),
    db.customer.count({ where }),
  ]);

  const totalPages = getTotalPages(total);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Clientes</h2>
          <p className="mt-1 text-sm text-gray-500">{total} cliente(s)</p>
        </div>
        <Link
          href="/admin/customers/new"
          className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
        >
          Nuevo cliente
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <TableSearch placeholder="Buscar por nombre, email o teléfono…" />
      </div>

      <CustomerTable
        rows={rows.map((c) => ({
          id: c.id,
          name: [c.name, c.surname].filter(Boolean).join(" "),
          email: c.email,
          phone: c.phone,
          country: c.country,
          orderCount: c._count.orders,
          createdAt: dateFmt.format(c.createdAt),
        }))}
        sort={sort}
        dir={dir}
        searchParams={params}
      />

      <Pagination page={page} totalPages={totalPages} searchParams={params} />
    </div>
  );
}
