import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { getSiteUrl } from "@/lib/env";
import { getAdapter } from "@/lib/payments";
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

  // For providers with a webhook, show this instance's endpoint URL so the
  // admin registers it in the matching provider dashboard (each instance has
  // its own signing secret, hence its own URL).
  const webhookUrl = getAdapter(gateway.provider)?.handleWebhook
    ? `${getSiteUrl()}/api/payments/webhook/${gateway.id}`
    : null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Editar pasarela</h2>

      {webhookUrl && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            URL del webhook
          </p>
          <p className="mt-1 break-all font-mono text-sm text-gray-700">
            {webhookUrl}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Registrala en el panel del proveedor (ej: Stripe → Developers →
            Webhooks) para confirmar los pagos de esta instancia.
          </p>
        </div>
      )}

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
