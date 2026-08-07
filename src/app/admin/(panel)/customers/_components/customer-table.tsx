"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  SortableHeader,
  type SortDir,
} from "@/app/admin/_components/sortable-header";
import { deleteCustomer } from "../actions";

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  orderCount: number;
  createdAt: string;
};

export function CustomerTable({
  rows,
  sort,
  dir,
  searchParams,
}: {
  rows: CustomerRow[];
  sort: string;
  dir: SortDir;
  searchParams: Record<string, string | undefined>;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-500">No se encontraron clientes.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <SortableHeader column="name" label="Cliente" currentSort={sort} currentDir={dir} searchParams={searchParams} />
            <SortableHeader column="email" label="Email" currentSort={sort} currentDir={dir} searchParams={searchParams} />
            <th className="px-5 py-3 font-medium">Teléfono</th>
            <th className="px-5 py-3 font-medium">País</th>
            <th className="px-5 py-3 text-center font-medium">Pedidos</th>
            <SortableHeader column="createdAt" label="Alta" currentSort={sort} currentDir={dir} searchParams={searchParams} />
            <th className="px-5 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <CustomerRowItem key={row.id} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomerRowItem({ row }: { row: CustomerRow }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const hasOrders = row.orderCount > 0;

  function handleDelete() {
    if (!confirm(`¿Eliminar al cliente "${row.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteCustomer(row.id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <tr className="text-gray-900">
      <td className="px-5 py-3 font-medium">
        <Link href={`/admin/customers/${row.id}`} className="hover:underline">
          {row.name}
        </Link>
      </td>
      <td className="px-5 py-3 text-gray-600">{row.email}</td>
      <td className="px-5 py-3 text-gray-500">{row.phone ?? "—"}</td>
      <td className="px-5 py-3 text-gray-500">{row.country ?? "—"}</td>
      <td className="px-5 py-3 text-center text-gray-600">{row.orderCount}</td>
      <td className="px-5 py-3 text-gray-500">{row.createdAt}</td>
      <td className="px-5 py-3">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/customers/${row.id}`}
              className="text-sm font-medium text-[#2563EB] hover:underline"
            >
              Ver
            </Link>
            {hasOrders ? (
              <span
                className="text-sm font-medium text-gray-300"
                title="No se puede eliminar un cliente con pedidos"
              >
                Eliminar
              </span>
            ) : (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
              >
                Eliminar
              </button>
            )}
          </div>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </td>
    </tr>
  );
}
