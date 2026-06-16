import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveCurrency, formatPrice } from "@/lib/currency-resolver";
import { getGatewaysForCurrency } from "@/lib/payments/checkout";
import { Container } from "@/components/ui/container";
import { CheckoutForm } from "../_components/checkout-form";

export const metadata: Metadata = { title: "Finalizar compra" };

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const currency = await getActiveCurrency();
  if (!currency) notFound();

  const product = await db.product.findFirst({
    where: { id: productId, visible: true },
    select: {
      id: true,
      name: true,
      prices: {
        where: { currencyId: currency.id },
        select: { amount: true },
      },
    },
  });
  if (!product) notFound();

  const price = product.prices[0];
  const gateways = price ? await getGatewaysForCurrency(currency.id) : [];

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finalizar compra</h1>
          <p className="mt-1 text-sm text-gray-500">{product.name}</p>
        </div>

        {!price ? (
          <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            Este producto no tiene precio en tu moneda ({currency.code}). Contactanos
            para completar la compra.
          </p>
        ) : gateways.length === 0 ? (
          <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            No hay métodos de pago disponibles para tu moneda ({currency.code}) en
            este momento.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-xl font-semibold text-gray-900">
                {formatPrice(Number(price.amount), currency.code)}
              </span>
            </div>
            <CheckoutForm
              productId={product.id}
              currencyId={currency.id}
              gateways={gateways}
            />
          </>
        )}
      </div>
    </Container>
  );
}
