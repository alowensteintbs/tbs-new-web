import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/currency-resolver";
import { readGatewayConfig } from "@/lib/payments/checkout";
import { Container } from "@/components/ui/container";

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
    note: "El pago no pudo completarse. Probá de nuevo o contactanos.",
  },
};

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const order = await db.order.findUnique({
    where: { number },
    select: {
      number: true,
      total: true,
      status: true,
      currency: { select: { code: true } },
      items: { select: { productName: true, quantity: true } },
      gateway: { select: { provider: true, config: true } },
    },
  });
  if (!order) notFound();

  const status = STATUS_COPY[order.status] ?? STATUS_COPY.PENDING!;

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
          <p className="text-sm text-gray-500">{status.note}</p>
        </div>

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
          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(Number(order.total), order.currency.code)}</span>
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
