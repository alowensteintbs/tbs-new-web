import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveCurrency, formatPrice } from "@/lib/currency-resolver";
import { getGatewaysForCurrency } from "@/lib/payments/checkout";
import { countryOptions } from "@/lib/countries";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { CheckoutForm } from "../_components/checkout-form";
import { CheckoutHeader } from "../_components/checkout-header";
import styles from "../_components/checkout.module.css";
import "@/components/home/home.css";

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

  const unavailableMessage = !price
    ? `Este producto no tiene precio en tu moneda (${currency.code}). Contactanos para completar la compra.`
    : gateways.length === 0
      ? `No hay métodos de pago disponibles para tu moneda (${currency.code}) en este momento.`
      : null;

  return (
    <main className={styles.page}>
      <section className={`tbs-grid-light ${styles.main}`}>
        <CheckoutHeader />
        <div className={styles.content}>
          {unavailableMessage || !price ? (
            <p className={styles.unavailable}>{unavailableMessage}</p>
          ) : (
            <CheckoutForm
              productId={product.id}
              productName={product.name}
              currencyId={currency.id}
              currencyCode={currency.code}
              gateways={gateways}
              countries={countries}
              amount={Number(price.amount)}
              amountLabel={formatPrice(Number(price.amount), currency.code)}
            />
          )}
        </div>
      </section>
      <TestimonialsSection />
    </main>
  );
}
