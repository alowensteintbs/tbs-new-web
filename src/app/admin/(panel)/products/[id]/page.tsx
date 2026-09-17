import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "../_components/product-form";
import {
  getAvailableLandingOptions,
  getCategoryOptions,
  getEnabledCurrencies,
} from "../_lib/queries";
import { isProductLandingSlug } from "@/lib/product-landings.server";

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, currencies, categories, landings] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { prices: true, images: { orderBy: { position: "asc" } } },
    }),
    getEnabledCurrencies(),
    getCategoryOptions(),
    getAvailableLandingOptions(id),
  ]);

  if (!product) notFound();
  if (!(await isProductLandingSlug(product.landingSlug))) notFound();

  const prices: Record<string, string> = {};
  for (const price of product.prices) {
    prices[price.currencyId] = price.amount.toString();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Editar producto</h2>
      <ProductForm
        currencies={currencies}
        categories={categories}
        landings={landings}
        initialValues={{
          id: product.id,
          name: product.name,
          landingSlug: product.landingSlug,
          sku: product.sku,
          description: product.description,
          academyId: product.academyId,
          categoryId: product.categoryId,
          visible: product.visible,
          prices,
          images: product.images.map((img) => ({ url: img.url, alt: img.alt })),
        }}
      />
    </div>
  );
}
