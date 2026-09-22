import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/currency-resolver";
import { getProvider } from "@/lib/payments/providers";
import { ORDER_STATUS_META } from "../_lib/status";
import { OrderStatusActions } from "../_components/order-status-actions";
import { ArchiveOrderButton, OrderNotesForm } from "../_components/order-operations";

export const metadata: Metadata = { title: "Detalle del pedido" };

const dateFmt = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "long",
  timeStyle: "short",
});

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.order.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      number: true,
      total: true,
      status: true,
      paymentRef: true,
      paymentMeta: true,
      failureReason: true,
      paidAt: true,
      createdAt: true,
      currency: { select: { code: true } },
      customer: {
        select: { id: true, name: true, email: true, phone: true, country: true },
      },
      gateway: { select: { name: true, provider: true } },
      items: {
        select: { productName: true, productSku: true, unitPrice: true, quantity: true },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        select: { id: true, body: true, authorName: true, createdAt: true },
      },
      events: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          source: true,
          message: true,
          previousStatus: true,
          nextStatus: true,
          payload: true,
          actorName: true,
          createdAt: true,
        },
      },
    },
  });
  if (!order) notFound();

  const meta = ORDER_STATUS_META[order.status];
  const currency = order.currency.code;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm text-gray-500 hover:underline"
          >
            ← Pedidos
          </Link>
          <h2 className="mt-1 text-xl font-bold text-gray-900">
            Pedido {order.number}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {dateFmt.format(order.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${meta.badge}`}
        >
          {meta.label}
        </span>
      </div>

      {/* Items */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Productos
        </h3>
        <ul className="divide-y divide-gray-100">
          {order.items.map((it, i) => (
            <li key={i} className="flex items-center justify-between py-3 text-sm">
              <div>
                <span className="font-medium text-gray-900">{it.productName}</span>
                {it.productSku && (
                  <span className="ml-2 text-xs text-gray-400">{it.productSku}</span>
                )}
                {it.quantity > 1 && (
                  <span className="ml-2 text-gray-500">× {it.quantity}</span>
                )}
              </div>
              <span className="text-gray-600">
                {formatPrice(Number(it.unitPrice) * it.quantity, currency)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(Number(order.total), currency)}</span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Cliente
          </h3>
          <dl className="space-y-2 text-sm">
            <Row label="Nombre" value={order.customer.name} />
            <Row label="Email" value={order.customer.email} />
            {order.customer.phone && <Row label="Teléfono" value={order.customer.phone} />}
            {order.customer.country && <Row label="País" value={order.customer.country} />}
          </dl>
          <Link
            href={`/admin/customers/${order.customer.id}`}
            className="mt-5 inline-block text-sm font-medium text-[#2563EB] hover:underline"
          >
            Editar datos del cliente
          </Link>
        </section>

        {/* Payment */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Pago
          </h3>
          <dl className="space-y-2 text-sm">
            <Row
              label="Método"
              value={
                order.gateway
                  ? order.gateway.name
                  : "—"
              }
            />
            {order.gateway && (
              <Row
                label="Proveedor"
                value={getProvider(order.gateway.provider)?.label ?? order.gateway.provider}
              />
            )}
            {order.paymentRef && <Row label="Referencia" value={order.paymentRef} />}
            {order.failureReason && (
              <Row label="Motivo del fallo" value={order.failureReason} />
            )}
            {order.paidAt && (
              <Row label="Pagado el" value={dateFmt.format(order.paidAt)} />
            )}
          </dl>
        </section>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Notas del equipo
        </h3>
        {order.notes.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">Todavía no hay notas.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {order.notes.map((note) => (
              <li key={note.id} className="rounded-lg bg-gray-50 p-3 text-sm">
                <p className="whitespace-pre-wrap text-gray-700">{note.body}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {note.authorName} · {dateFmt.format(note.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <OrderNotesForm orderId={order.id} />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Historial de movimientos
        </h3>
        {order.events.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">Aún no hay movimientos registrados.</p>
        ) : (
          <ol className="mt-4 space-y-4 border-l-2 border-gray-100 pl-4">
            {order.events.map((event) => (
              <li key={event.id} className="relative text-sm">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500" />
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-medium text-gray-900">{event.message}</p>
                  <time className="text-xs text-gray-400">{dateFmt.format(event.createdAt)}</time>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {event.source === "PAYMENT" ? "Pasarela de pago" : event.actorName ?? "Sistema"}
                  {event.previousStatus || event.nextStatus
                    ? ` · ${event.previousStatus ?? "—"} → ${event.nextStatus ?? "—"}`
                    : ""}
                </p>
                {event.payload && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-medium text-blue-700">
                      Ver respuesta / datos registrados
                    </summary>
                    <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-gray-950 p-3 text-xs leading-5 text-gray-100">
                      {prettyPayload(event.payload)}
                    </pre>
                  </details>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      {order.paymentMeta && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Última respuesta de la pasarela
          </h3>
          <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-gray-950 p-4 text-xs leading-5 text-gray-100">
            {prettyPayload(order.paymentMeta)}
          </pre>
        </section>
      )}

      {/* Status actions */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Acciones
        </h3>
        <OrderStatusActions orderId={order.id} status={order.status} />
        <ArchiveOrderButton orderId={order.id} />
      </section>
    </div>
  );
}

function prettyPayload(payload: string) {
  try {
    return JSON.stringify(JSON.parse(payload), null, 2);
  } catch {
    return payload;
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium text-gray-900">{value}</dd>
    </div>
  );
}
