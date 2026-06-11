"use client";

import Link from "next/link";
import { useTransition } from "react";
import { SortableHeader, type SortDir } from "@/app/admin/_components/sortable-header";
import { deleteProduct } from "../actions";

export type ProductRow = {
  id: string;
  name: string;
  prices: { code: string; symbol: string; amount: string }[];
};

export function ProductTable({
  rows,
  sort,
  dir,
  searchParams,
}: {
  rows: ProductRow[];
  sort: string;
  dir: SortDir;
  searchParams: Record<string, string | undefined>;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-500">No se encontraron productos.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <SortableHeader column="name" label="Nombre" currentSort={sort} currentDir={dir} searchParams={searchParams} />
            <th className="px-5 py-3 font-medium">Precios</th>
            <th className="px-5 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <ProductRowItem key={row.id} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductRowItem({ row }: { row: ProductRow }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`¿Eliminar el producto "${row.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    startTransition(() => deleteProduct(row.id));
  }

  return (
    <tr className="text-gray-900">
      <td className="px-5 py-3 font-medium">{row.name}</td>
      <td className="px-5 py-3 text-gray-600">
        {row.prices.length === 0 ? (
          <span className="text-gray-400">Sin precios</span>
        ) : (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {row.prices.map((price) => (
              <span key={price.code}>
                {price.symbol}
                {price.amount} {price.code}
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/admin/products/${row.id}`}
            className="text-sm font-medium text-[#2563EB] hover:underline"
          >
            Editar
          </Link>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
          >
            {isPending ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </td>
    </tr>
  );
}
