import type { Metadata } from "next";
import { ProductForm } from "../_components/product-form";
import { getEnabledCurrencies } from "../_lib/queries";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  const currencies = await getEnabledCurrencies();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Nuevo producto</h2>
        <p className="mt-1 text-sm text-gray-500">
          Cargá el nombre, la descripción y los precios por moneda.
        </p>
      </div>
      <ProductForm currencies={currencies} />
    </div>
  );
}
