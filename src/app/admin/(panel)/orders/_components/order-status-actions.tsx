"use client";

import { useState, useTransition } from "react";
import type { OrderStatus } from "@/generated/prisma/client";
import { ORDER_STATUS_META, ORDER_STATUS_TRANSITIONS } from "../_lib/status";
import { updateOrderStatus } from "../actions";

// Destructive actions get an explicit confirmation and red styling.
const DESTRUCTIVE: ReadonlySet<OrderStatus> = new Set([
  "CANCELLED",
  "REFUNDED",
  "FAILED",
]);

export function OrderStatusActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showFailureForm, setShowFailureForm] = useState(false);
  const [failureReason, setFailureReason] = useState("");
  const next = ORDER_STATUS_TRANSITIONS[status] ?? [];

  if (next.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No hay acciones disponibles para este estado.
      </p>
    );
  }

  function handle(target: OrderStatus) {
    if (target === "FAILED") {
      setError(null);
      setShowFailureForm(true);
      return;
    }
    const label = ORDER_STATUS_META[target].label.toLowerCase();
    if (
      DESTRUCTIVE.has(target) &&
      !confirm(`¿Marcar el pedido como ${label}?`)
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, target);
      if (result.error) setError(result.error);
    });
  }

  function submitFailure(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!failureReason.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, "FAILED", failureReason);
      if (result.error) setError(result.error);
      else {
        setFailureReason("");
        setShowFailureForm(false);
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {next.map((target) => {
          const destructive = DESTRUCTIVE.has(target);
          return (
            <button
              key={target}
              onClick={() => handle(target)}
              disabled={isPending}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
                destructive
                  ? "border border-red-200 text-red-600 hover:bg-red-50"
                  : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              }`}
            >
              Marcar {ORDER_STATUS_META[target].label.toLowerCase()}
            </button>
          );
        })}
      </div>
      {showFailureForm && (
        <form onSubmit={submitFailure} className="max-w-xl rounded-lg border border-red-100 bg-red-50 p-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="failure-reason">
            Motivo del fallo
          </label>
          <textarea
            id="failure-reason"
            value={failureReason}
            onChange={(event) => setFailureReason(event.target.value)}
            maxLength={2_000}
            rows={3}
            autoFocus
            placeholder="Ej. transferencia rechazada o pago no recibido"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={isPending || !failureReason.trim()}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Confirmar fallo
            </button>
            <button
              type="button"
              onClick={() => setShowFailureForm(false)}
              disabled={isPending}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
