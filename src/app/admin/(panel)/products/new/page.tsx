import type { Metadata } from "next";
import { ProductForm } from "../_components/product-form";
import { getEnabledCurrencies, getCategoryOptions } from "../_lib/queries";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  const [currencies, categories] = await Promise.all([
    getEnabledCurrencies(),
    getCategoryOptions(),
  ]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Nuevo producto</h2>
        <p className="mt-1 text-sm text-gray-500">
          Carga el nombre, la descripción y los precios por moneda.
        </p>
      </div>
      <ProductForm currencies={currencies} categories={categories} />
    </div>
  );
}
