"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleCoupon, deleteCoupon } from "../actions";

export type CouponRow = {
  id: string;
  code: string;
  valueLabel: string;
  scopeLabel: string;
  validityLabel: string;
  usageLabel: string;
  enabled: boolean;
};

export function CouponTable({ coupons }: { coupons: CouponRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (coupons.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
        Todavía no hay cupones. Crea el primero.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {error && <p className="bg-red-50 px-5 py-2 text-sm text-red-600">{error}</p>}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-400">
            <th className="px-5 py-3 font-semibold">Código</th>
            <th className="px-5 py-3 font-semibold">Descuento</th>
            <th className="px-5 py-3 font-semibold">Alcance</th>
            <th className="px-5 py-3 font-semibold">Validez</th>
            <th className="px-5 py-3 font-semibold">Usos</th>
            <th className="px-5 py-3 font-semibold">Estado</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {coupons.map((c) => (
            <tr key={c.id}>
              <td className="px-5 py-3 font-mono font-medium text-gray-900">
                {c.code}
              </td>
              <td className="px-5 py-3 text-gray-700">{c.valueLabel}</td>
              <td className="px-5 py-3 text-gray-500">{c.scopeLabel}</td>
              <td className="px-5 py-3 text-gray-500">{c.validityLabel}</td>
              <td className="px-5 py-3 text-gray-500">{c.usageLabel}</td>
              <td className="px-5 py-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(() => toggleCoupon(c.id, !c.enabled))
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
                    c.enabled
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {c.enabled ? "Habilitado" : "Deshabilitado"}
                </button>
              </td>
              <td className="px-5 py-3 text-right whitespace-nowrap">
                <Link
                  href={`/admin/descuentos/${c.id}`}
                  className="text-sm font-medium text-[#2563EB] hover:underline"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (!confirm(`¿Eliminar el cupón ${c.code}?`)) return;
                    setError(null);
                    startTransition(async () => {
                      const r = await deleteCoupon(c.id);
                      if (r.error) setError(r.error);
                    });
                  }}
                  className="ml-4 text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
