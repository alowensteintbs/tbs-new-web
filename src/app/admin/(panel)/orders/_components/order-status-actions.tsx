"use client";

import { useState, useTransition } from "react";
import type { OrderStatus } from "@/generated/prisma/client";
import { ORDER_STATUS_META } from "../_lib/status";
import { updateOrderStatus } from "../actions";

/** Status transitions offered per current status (kept deliberately simple). */
const TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ["PAID", "CANCELLED", "FAILED"],
  PAID: ["FULFILLED", "REFUNDED"],
  FULFILLED: ["REFUNDED"],
  FAILED: ["PENDING", "CANCELLED"],
};

// Destructive-ish actions get a confirm + red styling.
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
  const next = TRANSITIONS[status] ?? [];

  if (next.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No hay acciones disponibles para este estado.
      </p>
    );
  }

  function handle(target: OrderStatus) {
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
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
