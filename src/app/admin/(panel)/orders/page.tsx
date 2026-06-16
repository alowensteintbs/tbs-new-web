import type { Metadata } from "next";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { TableSearch } from "@/app/admin/_components/table-search";
import { StatusFilter } from "@/app/admin/_components/status-filter";
import type { SortDir } from "@/app/admin/_components/sortable-header";
import { Pagination } from "@/app/admin/_components/pagination";
import { getPagination, getTotalPages } from "@/lib/pagination";
import { ORDER_STATUS_META, ORDER_STATUSES } from "./_lib/status";
import { OrderTable } from "./_components/order-table";

export const metadata: Metadata = { title: "Pedidos" };

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_META[s].label })),
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status ?? "";
  const dir: SortDir = params.dir === "asc" ? "asc" : "desc";

  const where: Prisma.OrderWhereInput = {
    ...(q && {
      OR: [
        { number: { contains: q } },
        { customer: { email: { contains: q } } },
        { customer: { name: { contains: q } } },
      ],
    }),
    ...(status && ORDER_STATUSES.includes(status as never) && { status: status as never }),
  };

  const { page, skip, take } = getPagination(params);

  const [rows, total] = await db.$transaction([
    db.order.findMany({
      where,
      orderBy: { createdAt: dir },
      select: {
        id: true,
        number: true,
        total: true,
        status: true,
        createdAt: true,
        currency: { select: { code: true } },
        customer: { select: { name: true, email: true } },
      },
      skip,
      take,
    }),
    db.order.count({ where }),
  ]);

  const totalPages = getTotalPages(total);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pedidos</h2>
        <p className="mt-1 text-sm text-gray-500">{total} pedido(s)</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <TableSearch placeholder="Buscar por número, email o nombre…" />
        <StatusFilter options={STATUS_OPTIONS} />
      </div>

      <OrderTable
        rows={rows.map((r) => ({
          id: r.id,
          number: r.number,
          total: Number(r.total),
          currencyCode: r.currency.code,
          status: r.status,
          customerName: r.customer.name,
          customerEmail: r.customer.email,
          createdAt: r.createdAt.toISOString(),
        }))}
        dir={dir}
        searchParams={params}
      />

      <Pagination page={page} totalPages={totalPages} searchParams={params} />
    </div>
  );
}
