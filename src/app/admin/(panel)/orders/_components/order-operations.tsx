"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addOrderNote, archiveOrder } from "../actions";

export function OrderNotesForm({ orderId }: { orderId: string }) {
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addOrderNote(orderId, body);
      if (result.error) setError(result.error);
      else setBody("");
    });
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-2">
      <label className="sr-only" htmlFor="order-note">Nueva nota interna</label>
      <textarea
        id="order-note"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={10_000}
        rows={3}
        placeholder="Añadir una nota interna…"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isPending || !body.trim()}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Añadir nota
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

export function ArchiveOrderButton({ orderId, orderNumber, compact = false }: {
  orderId: string;
  orderNumber?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function archive() {
    if (!confirm(`¿Eliminar ${orderNumber ?? "este pedido"} del listado? Se conservarán sus datos e historial. Esta acción no cancela ni reembolsa el pago.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await archiveOrder(orderId);
        if (result.error) setError(result.error);
        else if (!compact) router.push("/admin/orders");
      } catch {
        setError("No se pudo eliminar el pedido. Intentá nuevamente.");
      }
    });
  }

  return (
    <div className={compact ? "inline-block" : "mt-5 border-t border-gray-100 pt-5"}>
      <button
        type="button"
        onClick={archive}
        disabled={isPending}
        aria-label={compact ? `Eliminar pedido ${orderNumber ?? orderId}` : undefined}
        className={compact
          ? "text-sm font-medium text-red-600 hover:underline disabled:cursor-wait disabled:opacity-50"
          : "rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"}
      >
        {isPending ? "Eliminando…" : compact ? "Eliminar" : "Eliminar pedido"}
      </button>
      {!compact && <p className="mt-2 text-xs text-gray-500">Se oculta el pedido conservando sus datos e historial. No cancela ni reembolsa el pago.</p>}
      {error && <p role="alert" className="mt-2 max-w-64 whitespace-normal text-sm text-red-600">{error}</p>}
    </div>
  );
}
