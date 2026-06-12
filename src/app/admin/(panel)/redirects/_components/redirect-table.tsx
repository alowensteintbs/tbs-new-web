"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteRedirect, toggleRedirect } from "../actions";

export type RedirectRow = {
  id: string;
  from: string;
  to: string;
  statusCode: number;
  enabled: boolean;
};

export function RedirectTable({ rows }: { rows: RedirectRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-500">No hay redirecciones.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-5 py-3 font-medium">Desde</th>
            <th className="px-5 py-3 font-medium">Hacia</th>
            <th className="px-5 py-3 font-medium">Tipo</th>
            <th className="px-5 py-3 font-medium">Estado</th>
            <th className="px-5 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <RedirectRowItem key={row.id} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RedirectRowItem({ row }: { row: RedirectRow }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    startTransition(() => toggleRedirect(row.id, !row.enabled));
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar la redirección desde "${row.from}"?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteRedirect(row.id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <tr className="text-gray-900">
      <td className="px-5 py-3 font-medium">{row.from}</td>
      <td className="px-5 py-3 text-gray-600">{row.to}</td>
      <td className="px-5 py-3 text-gray-600">{row.statusCode}</td>
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
          {row.enabled ? "Activa" : "Inactiva"}
        </button>
      </td>
      <td className="px-5 py-3">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/redirects/${row.id}`}
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
