"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { SortableHeader, type SortDir } from "@/app/admin/_components/sortable-header";
import { deleteCurrency, toggleCurrency } from "../actions";

export type CurrencyRow = {
  id: string;
  code: string;
  name: string;
  symbol: string;
  enabled: boolean;
};

export function CurrencyTable({
  rows,
  sort,
  dir,
  searchParams,
}: {
  rows: CurrencyRow[];
  sort: string;
  dir: SortDir;
  searchParams: Record<string, string | undefined>;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-500">No se encontraron monedas.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <SortableHeader column="code" label="Código" currentSort={sort} currentDir={dir} searchParams={searchParams} />
            <SortableHeader column="name" label="Nombre" currentSort={sort} currentDir={dir} searchParams={searchParams} />
            <th className="px-5 py-3 font-medium">Símbolo</th>
            <th className="px-5 py-3 font-medium">Estado</th>
            <th className="px-5 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <CurrencyRowItem key={row.id} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CurrencyRowItem({ row }: { row: CurrencyRow }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    startTransition(() => toggleCurrency(row.id, !row.enabled));
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar la moneda "${row.code}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteCurrency(row.id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <tr className="text-gray-900">
      <td className="px-5 py-3 font-medium">{row.code}</td>
      <td className="px-5 py-3 text-gray-600">{row.name}</td>
      <td className="px-5 py-3 text-gray-600">{row.symbol}</td>
      <td className="px-5 py-3">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition disabled:opacity-50 ${
            row.enabled
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {row.enabled ? "Habilitada" : "Deshabilitada"}
        </button>
      </td>
      <td className="px-5 py-3">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/currencies/${row.id}`}
              className="text-sm font-medium text-[#2563EB] hover:underline"
            >
              Editar
            </Link>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
            >
              Eliminar
            </button>
          </div>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </td>
    </tr>
  );
}
