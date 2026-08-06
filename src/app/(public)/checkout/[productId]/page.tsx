import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveCurrency, formatPrice } from "@/lib/currency-resolver";
import { getGatewaysForCurrency } from "@/lib/payments/checkout";
import { countryOptions } from "@/lib/countries";
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

  // Billing-country options: restricted to the currency's configured countries
  // when set (so dLocal/BNPL only see supported countries), else the full list.
  const currencyRow = await db.currency.findUnique({
    where: { id: currency.id },
    select: { countryCodes: true },
  });
  const allowedCountries = (currencyRow?.countryCodes ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const countries = countryOptions(allowedCountries);

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
            <CheckoutForm
              productId={product.id}
              currencyId={currency.id}
              gateways={gateways}
              countries={countries}
              amountLabel={formatPrice(Number(price.amount), currency.code)}
            />
          </>
        )}
      </div>
    </Container>
  );
}
