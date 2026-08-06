import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/currency-resolver";
import { readGatewayConfig } from "@/lib/payments/checkout";
import { Container } from "@/components/ui/container";
import { PendingPoller } from "./pending-poller";

export const metadata: Metadata = { title: "Tu pedido" };

// Order state changes after payment, so never cache this page.
export const dynamic = "force-dynamic";

const STATUS_COPY: Record<
  string,
  { label: string; tone: string; note: string }
> = {
  PENDING: {
    label: "Pendiente de pago",
    tone: "bg-amber-100 text-amber-800",
    note: "Estamos esperando la confirmación de tu pago.",
  },
  PAID: {
    label: "Pago confirmado",
    tone: "bg-green-100 text-green-800",
    note: "¡Gracias! Tu pago fue recibido.",
  },
  FULFILLED: {
    label: "Completado",
    tone: "bg-green-100 text-green-800",
    note: "Tu pedido fue entregado.",
  },
  CANCELLED: {
    label: "Cancelado",
    tone: "bg-gray-100 text-gray-600",
    note: "Este pedido fue cancelado.",
  },
  REFUNDED: {
    label: "Reembolsado",
    tone: "bg-gray-100 text-gray-600",
    note: "Este pedido fue reembolsado.",
  },
  FAILED: {
    label: "Pago fallido",
    tone: "bg-red-100 text-red-700",
    note: "El pago no pudo completarse. Prueba de nuevo o contáctanos.",
  },
};

export default async function OrderStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const { id } = await params;
  const { paid } = await searchParams;
  const order = await db.order.findUnique({
    where: { id },
    select: {
      number: true,
      subtotal: true,
      discountAmount: true,
      couponCode: true,
      total: true,
      status: true,
      currency: { select: { code: true } },
      items: { select: { productName: true, quantity: true } },
      gateway: { select: { provider: true, config: true } },
    },
  });
  if (!order) notFound();

  const status = STATUS_COPY[order.status] ?? STATUS_COPY.PENDING!;

  // The buyer just came back from a redirect provider: the confirming webhook
  // may still be in flight. Poll (and show a distinct "confirming" copy) while
  // the order is PENDING, except for manual transfer (no webhook to wait for).
  const awaitingConfirmation =
    order.status === "PENDING" && order.gateway?.provider !== "manual";
  const justReturned = paid === "1";

  // For a pending manual transfer, surface the payment instructions.
  const manualInstructions =
    order.status === "PENDING" && order.gateway?.provider === "manual"
      ? readGatewayConfig(order.gateway.config).instructions
      : undefined;

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="space-y-2 text-center">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${status.tone}`}
          >
            {status.label}
          </span>
          <h1 className="text-2xl font-bold text-gray-900">Pedido {order.number}</h1>
          {awaitingConfirmation && justReturned ? (
            <p className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              Estamos confirmando tu pago, esto puede tardar unos segundos…
            </p>
          ) : (
            <p className="text-sm text-gray-500">{status.note}</p>
          )}
        </div>

        {awaitingConfirmation && <PendingPoller active />}

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <ul className="space-y-2 text-sm text-gray-700">
            {order.items.map((it, i) => (
              <li key={i} className="flex justify-between">
                <span>
                  {it.productName}
                  {it.quantity > 1 && ` × ${it.quantity}`}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-gray-100 pt-4">
            {Number(order.discountAmount) > 0 && (
              <>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(Number(order.subtotal), order.currency.code)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-700">
                  <span>
                    Descuento{order.couponCode ? ` (${order.couponCode})` : ""}
                  </span>
                  <span>
                    −{formatPrice(Number(order.discountAmount), order.currency.code)}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(Number(order.total), order.currency.code)}</span>
            </div>
          </div>
        </div>

        {manualInstructions && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">
              Instrucciones de pago
            </h2>
            <p className="whitespace-pre-line text-sm text-gray-600">
              {manualInstructions}
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}
