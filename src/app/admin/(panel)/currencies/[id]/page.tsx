import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CurrencyForm } from "../_components/currency-form";

export const metadata: Metadata = { title: "Editar moneda" };

export default async function EditCurrencyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currency = await db.currency.findUnique({ where: { id } });
  if (!currency) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Editar moneda</h2>
      <CurrencyForm
        initialValues={{
          id: currency.id,
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol,
          enabled: currency.enabled,
        }}
      />
    </div>
  );
}
