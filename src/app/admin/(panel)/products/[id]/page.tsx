import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "../_components/product-form";
import { getEnabledCurrencies, getCategoryOptions } from "../_lib/queries";

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, currencies, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { prices: true, images: { orderBy: { position: "asc" } } },
    }),
    getEnabledCurrencies(),
    getCategoryOptions(),
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
        categories={categories}
        initialValues={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          academyId: product.academyId,
          categoryId: product.categoryId,
          visible: product.visible,
          featured: product.featured,
          prices,
          images: product.images.map((img) => ({ url: img.url, alt: img.alt })),
        }}
      />
    </div>
  );
}
