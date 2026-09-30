import type { Metadata } from "next";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { SortDir } from "@/app/admin/_components/sortable-header";
import { Pagination } from "@/app/admin/_components/pagination";
import { getPagination, getTotalPages } from "@/lib/pagination";
import { getOrderWhere } from "./_lib/filters";
import { OrderFilters } from "./_components/order-filters";
import { requireSession } from "@/lib/auth/dal";
import { OrderTable } from "./_components/order-table";

export const metadata: Metadata = { title: "Pedidos" };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireSession();
  const params = await searchParams;
  const dir: SortDir = params.dir === "asc" ? "asc" : "desc";

  let where: Prisma.OrderWhereInput;
  let filterError: string | undefined;
  try { where = getOrderWhere(params); }
  catch (error) {
    filterError = error instanceof Error ? error.message : "No se pudieron aplicar los filtros.";
    where = { id: "" };
  }

  const { page, skip, take } = getPagination(params);

  // Consultas de lectura independientes: no serializarlas en una transacción.
  const [courses, currencies, gateways, rows, total] = await Promise.all([
    db.product.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.currency.findMany({ select: { id: true, code: true }, orderBy: { code: "asc" } }),
    db.paymentGateway.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.order.findMany({
      where,
      orderBy: [{ createdAt: dir }, { seq: dir }],
      select: {
        id: true,
        number: true,
        total: true,
        status: true,
        createdAt: true,
        currency: { select: { code: true } },
        customer: { select: { name: true, surname: true, email: true } },
      },
      skip,
      take,
    }),
    db.order.count({ where }),
  ]);

  const totalPages = getTotalPages(total);

  return (
    <div className="flex h-full min-h-[48rem] flex-col gap-6 sm:min-h-[36rem]">
      <div className="shrink-0">
        <h2 className="text-xl font-bold text-gray-900">Pedidos</h2>
        <p className="mt-1 text-sm text-gray-500">{total} pedido(s)</p>
      </div>

      <OrderFilters
        key={JSON.stringify(params)}
        params={params}
        courses={courses}
        currencies={currencies.map((currency) => ({ id: currency.id, name: currency.code }))}
        gateways={gateways}
        exportEnabled={!filterError}
      />
      {filterError && <p role="alert" className="shrink-0 text-sm text-red-600">{filterError}</p>}

      <OrderTable
        rows={rows.map((r) => ({
          id: r.id,
          number: r.number,
          total: Number(r.total),
          currencyCode: r.currency.code,
          status: r.status,
          customerName: [r.customer.name, r.customer.surname].filter(Boolean).join(" "),
          customerEmail: r.customer.email,
          createdAt: r.createdAt.toISOString(),
        }))}
        dir={dir}
        searchParams={params}
      />

      <div className="shrink-0">
        <Pagination page={page} totalPages={totalPages} searchParams={params} />
      </div>
    </div>
  );
}
