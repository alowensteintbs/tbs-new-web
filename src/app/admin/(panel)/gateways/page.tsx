import type { Metadata } from "next";
import Link from "next/link";
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
    provider: g.provider,
    providerLabel: getProvider(g.provider)?.label ?? g.provider,
    live: g.live,
    enabled: g.enabled,
    currencyCodes: g.currencies.map((c) => c.currency.code),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pasarelas de pago</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configurá los métodos de pago. Un proveedor puede tener varias
            instancias (ej: una cuenta Stripe por región), cada una con sus
            propias credenciales y monedas.
          </p>
        </div>
        <Link
          href="/admin/gateways/new"
          className="shrink-0 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
        >
          Nueva pasarela
        </Link>
      </div>

      <GatewayTable rows={rows} />
    </div>
  );
}
