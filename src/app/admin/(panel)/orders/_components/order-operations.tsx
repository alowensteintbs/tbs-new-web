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

export function ArchiveOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function archive() {
    if (!confirm("¿Eliminar este pedido de las vistas operativas? Se conservará su historial para auditoría.")) return;
    setError(null);
    startTransition(async () => {
      const result = await archiveOrder(orderId);
      if (result.error) setError(result.error);
      else router.push("/admin/orders");
    });
  }

  return (
    <div className="mt-5 border-t border-gray-100 pt-5">
      <button
        type="button"
        onClick={archive}
        disabled={isPending}
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Eliminar pedido
      </button>
      <p className="mt-2 text-xs text-gray-500">Solo se pueden eliminar pedidos sin cobro registrado.</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
