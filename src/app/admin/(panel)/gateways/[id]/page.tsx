import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { getProvider } from "@/lib/payments/providers";
import { GatewayForm } from "../_components/gateway-form";

export const metadata: Metadata = { title: "Editar pasarela" };

export default async function EditGatewayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gateway = await db.paymentGateway.findUnique({
    where: { id },
    select: {
      id: true,
      provider: true,
      name: true,
      enabled: true,
      live: true,
      config: true,
      currencies: { select: { currencyId: true } },
    },
  });
  if (!gateway) notFound();

  const currencies = await db.currency.findMany({
    where: { enabled: true },
    orderBy: { code: "asc" },
    select: { id: true, code: true, name: true },
  });

  // Decrypt config, then strip secret values so they never reach the client —
  // the form shows a "sin cambios" placeholder for them instead.
  let stored: Record<string, string> = {};
  try {
    stored = JSON.parse(decrypt(gateway.config)) as Record<string, string>;
  } catch {
    stored = {};
  }
  const def = getProvider(gateway.provider);
  const config: Record<string, string> = {};
  for (const field of def?.fields ?? []) {
    if (!field.secret && stored[field.key]) config[field.key] = stored[field.key];
    // Mark presence of a secret so the placeholder reads "sin cambios".
    if (field.secret && stored[field.key]) config[field.key] = "•";
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Editar pasarela</h2>
      <GatewayForm
        currencies={currencies}
        initialValues={{
          id: gateway.id,
          provider: gateway.provider,
          name: gateway.name,
          enabled: gateway.enabled,
          live: gateway.live,
          currencyIds: gateway.currencies.map((c) => c.currencyId),
          config,
        }}
      />
    </div>
  );
}
