import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "../_components/product-form";
import { getEnabledCurrencies } from "../_lib/queries";

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, currencies] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { prices: true },
    }),
    getEnabledCurrencies(),
  ]);

  if (!product) notFound();

  const prices: Record<string, string> = {};
  for (const price of product.prices) {
    prices[price.currencyId] = price.amount.toString();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Editar producto</h2>
      <ProductForm
        currencies={currencies}
        initialValues={{
          id: product.id,
          name: product.name,
          description: product.description,
          academyId: product.academyId,
          prices,
        }}
      />
    </div>
  );
}
