import type { Metadata } from "next";
import { CurrencyForm } from "../_components/currency-form";

export const metadata: Metadata = { title: "Nueva moneda" };

export default function NewCurrencyPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Nueva moneda</h2>
        <p className="mt-1 text-sm text-gray-500">
          Agregá una moneda para poder cargar precios en ella.
        </p>
      </div>
      <CurrencyForm />
    </div>
  );
}
