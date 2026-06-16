import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getProvider } from "@/lib/payments/providers";
import { GatewayTable } from "./_components/gateway-table";

export const metadata: Metadata = { title: "Pasarelas de pago" };

export default async function GatewaysPage() {
  const gateways = await db.paymentGateway.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      provider: true,
      live: true,
      enabled: true,
      currencies: { select: { currency: { select: { code: true } } } },
    },
  });

  const rows = gateways.map((g) => ({
    id: g.id,
    name: g.name,
    providerLabel: getProvider(g.provider)?.label ?? g.provider,
    live: g.live,
    enabled: g.enabled,
    currencyCodes: g.currencies.map((c) => c.currency.code),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pasarelas de pago</h2>
        <p className="mt-1 text-sm text-gray-500">
          Habilitá y configurá los métodos de pago disponibles.
        </p>
      </div>

      <GatewayTable rows={rows} />
    </div>
  );
}
