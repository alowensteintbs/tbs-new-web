"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteGateway, toggleGateway } from "../actions";

export type GatewayRow = {
  id: string;
  name: string;
  providerLabel: string;
  live: boolean;
  enabled: boolean;
  currencyCodes: string[];
};

export function GatewayTable({ rows }: { rows: GatewayRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-5 py-3 font-medium">Nombre</th>
            <th className="px-5 py-3 font-medium">Proveedor</th>
            <th className="px-5 py-3 font-medium">Monedas</th>
            <th className="px-5 py-3 font-medium">Modo</th>
            <th className="px-5 py-3 font-medium">Estado</th>
            <th className="px-5 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <GatewayRowItem key={row.id} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GatewayRowItem({ row }: { row: GatewayRow }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleToggle() {
    startTransition(() => toggleGateway(row.id, !row.enabled));
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteGateway(row.id);
      setConfirming(false);
    });
  }

  return (
    <tr className="text-gray-900">
      <td className="px-5 py-3 font-medium">{row.name}</td>
      <td className="px-5 py-3 text-gray-600">{row.providerLabel}</td>
      <td className="px-5 py-3 text-gray-600">
        {row.currencyCodes.length > 0 ? row.currencyCodes.join(", ") : "—"}
      </td>
      <td className="px-5 py-3">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.live ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {row.live ? "Live" : "Test"}
        </span>
      </td>
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
      <td className="px-5 py-3 text-right">
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/admin/gateways/${row.id}`}
            className="text-sm font-medium text-[#2563EB] hover:underline"
          >
            Configurar
          </Link>
          {confirming ? (
            <>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={isPending}
                className="text-sm text-gray-400 hover:underline"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-sm font-medium text-gray-400 hover:text-red-600 hover:underline"
            >
              Eliminar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
