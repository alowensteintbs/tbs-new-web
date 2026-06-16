import Link from "next/link";
import type { OrderStatus } from "@/generated/prisma/client";
import { formatPrice } from "@/lib/currency-resolver";
import { SortableHeader, type SortDir } from "@/app/admin/_components/sortable-header";
import { ORDER_STATUS_META } from "../_lib/status";

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
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-500">No se encontraron pedidos.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
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
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => {
            const meta = ORDER_STATUS_META[row.status];
            return (
              <tr key={row.id} className="text-gray-900">
                <td className="px-5 py-3 font-medium">{row.number}</td>
                <td className="px-5 py-3 text-gray-600">
                  <span className="block">{row.customerName}</span>
                  <span className="block text-xs text-gray-400">
                    {row.customerEmail}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {formatPrice(row.total, row.currencyCode)}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}
                  >
                    {meta.label}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {dateFmt.format(new Date(row.createdAt))}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/orders/${row.id}`}
                    className="text-sm font-medium text-[#2563EB] hover:underline"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
