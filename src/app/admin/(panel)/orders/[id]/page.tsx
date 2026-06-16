import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/currency-resolver";
import { getProvider } from "@/lib/payments/providers";
import { ORDER_STATUS_META } from "../_lib/status";
import { OrderStatusActions } from "../_components/order-status-actions";

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
  const order = await db.order.findUnique({
    where: { id },
    select: {
      id: true,
      number: true,
      total: true,
      status: true,
      paymentRef: true,
      paidAt: true,
      createdAt: true,
      currency: { select: { code: true } },
      customer: { select: { name: true, email: true, phone: true, country: true } },
      gateway: { select: { name: true, provider: true } },
      items: {
        select: { productName: true, productSku: true, unitPrice: true, quantity: true },
      },
    },
  });
  if (!order) notFound();

  const meta = ORDER_STATUS_META[order.status];
  const currency = order.currency.code;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
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

      <div className="grid gap-6 sm:grid-cols-2">
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
            {order.paidAt && (
              <Row label="Pagado el" value={dateFmt.format(order.paidAt)} />
            )}
          </dl>
        </section>
      </div>

      {/* Status actions */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Acciones
        </h3>
        <OrderStatusActions orderId={order.id} status={order.status} />
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-900">{value}</dd>
    </div>
  );
}
