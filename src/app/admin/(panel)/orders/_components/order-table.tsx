import Link from "next/link";
import type { OrderStatus } from "@/generated/prisma/client";
import { formatPrice } from "@/lib/currency-resolver";
import { SortableHeader, type SortDir } from "@/app/admin/_components/sortable-header";
import { ORDER_STATUS_META } from "../_lib/status";
import { ORDER_TIME_ZONE } from "../_lib/filters";
import { ArchiveOrderButton } from "./order-operations";

export type OrderRow = {
  id: string;
  number: string;
  total: number;
  currencyCode: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  createdAt: string;
};

const dateFmt = new Intl.DateTimeFormat("es-ES", {
  timeZone: ORDER_TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

export function OrderTable({
  rows,
  dir,
  searchParams,
}: {
  rows: OrderRow[];
  dir: SortDir;
  searchParams: Record<string, string | undefined>;
}) {
  if (rows.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-500">No se encontraron pedidos.</p>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Listado de pedidos"
      tabIndex={0}
      className="min-h-0 flex-1 overflow-auto overscroll-contain rounded-xl border border-gray-200 bg-white shadow-sm [scrollbar-gutter:stable] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left text-sm">
        <thead className="text-xs uppercase text-gray-500 [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:border-b [&_th]:border-gray-200 [&_th]:bg-gray-50">
          <tr>
            <th className="px-5 py-3 font-medium">Pedido</th>
            <th className="px-5 py-3 font-medium">Cliente</th>
            <th className="px-5 py-3 font-medium">Total</th>
            <th className="px-5 py-3 font-medium">Estado</th>
            <SortableHeader
              column="createdAt"
              label="Fecha"
              currentSort="createdAt"
              currentDir={dir}
              searchParams={searchParams}
            />
            <th className="px-5 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="[&_td]:border-b [&_td]:border-gray-100 [&_tr:last-child_td]:border-b-0">
          {rows.map((row) => {
            const meta = ORDER_STATUS_META[row.status];
            return (
              <tr key={row.id} className="text-gray-900 transition-colors hover:bg-gray-50 focus-within:bg-blue-50/50">
                <td className="whitespace-nowrap px-5 py-3 font-medium">
                  <Link href={`/admin/orders/${row.id}`} className="text-[#2563EB] hover:underline">
                    {row.number}
                  </Link>
                </td>
                <td className="px-5 py-3 text-gray-600">
                  <span className="block">{row.customerName}</span>
                  <span className="block text-xs text-gray-400">
                    {row.customerEmail}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-gray-600">
                  {formatPrice(row.total, row.currencyCode)}
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}
                  >
                    {meta.label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-gray-500">
                  {dateFmt.format(new Date(row.createdAt))}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-start justify-end gap-3">
                  <Link
                    href={`/admin/orders/${row.id}`}
                    className="text-sm font-medium text-[#2563EB] hover:underline"
                  >
                    Ver
                  </Link>
                  <ArchiveOrderButton orderId={row.id} orderNumber={row.number} compact />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
