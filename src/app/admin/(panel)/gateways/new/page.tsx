import type { Metadata } from "next";
import { db } from "@/lib/db";
import { GatewayForm } from "../_components/gateway-form";

export const metadata: Metadata = { title: "Nueva pasarela" };

export default async function NewGatewayPage() {
  const currencies = await db.currency.findMany({
    where: { enabled: true },
    orderBy: { code: "asc" },
    select: { id: true, code: true, name: true },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Nueva pasarela</h2>
      <GatewayForm
        mode="create"
        currencies={currencies}
        initialValues={{
          id: "",
          provider: "",
          name: "",
          enabled: false,
          live: false,
          currencyIds: [],
          config: {},
        }}
      />
    </div>
  );
}
