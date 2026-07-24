"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";
import { decrypt, encrypt } from "@/lib/crypto";
import { getProvider, isKnownProvider } from "@/lib/payments/providers";

const gatewaySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(80),
  enabled: z.boolean().default(true),
  live: z.boolean().default(false),
  currencyIds: z.array(z.string()).default([]),
});

export type GatewayFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseForm(formData: FormData) {
  return gatewaySchema.safeParse({
    name: formData.get("name"),
    enabled: formData.get("enabled") === "on",
    live: formData.get("live") === "on",
    currencyIds: formData.getAll("currencyIds").map(String),
  });
}

/**
 * Build the encrypted `config` JSON from the submitted credential fields.
 * For secret fields left blank on edit, the previous value is preserved so
 * the admin never has to re-type secrets just to change another setting.
 */
function buildConfig(
  provider: string,
  formData: FormData,
  previous?: Record<string, string>
): string {
  const def = getProvider(provider);
  const config: Record<string, string> = {};

  for (const field of def?.fields ?? []) {
    const submitted = String(formData.get(`config.${field.key}`) ?? "");
    if (field.secret && submitted === "" && previous?.[field.key]) {
      config[field.key] = previous[field.key];
    } else {
      config[field.key] = submitted;
    }
  }

  return encrypt(JSON.stringify(config));
}

function decryptConfig(payload: string): Record<string, string> {
  try {
    return JSON.parse(decrypt(payload)) as Record<string, string>;
  } catch {
    return {};
  }
}

async function setCurrencies(gatewayId: string, currencyIds: string[]) {
  await db.gatewayCurrency.deleteMany({ where: { gatewayId } });
  if (currencyIds.length > 0) {
    await db.gatewayCurrency.createMany({
      data: currencyIds.map((currencyId) => ({ gatewayId, currencyId })),
    });
  }
}

/**
 * Create a new gateway instance for a provider. A provider can have several
 * instances (e.g. a Stripe account per region), so the provider key IS taken
 * from the form here — but validated against the registry.
 */
export async function createGateway(
  _prev: GatewayFormState,
  formData: FormData
): Promise<GatewayFormState> {
  await requireSession();

  const provider = String(formData.get("provider") ?? "");
  if (!isKnownProvider(provider)) return { error: "Proveedor inválido." };

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { currencyIds, ...data } = parsed.data;
  const config = buildConfig(provider, formData);

  // Place new rows after existing ones so checkout ordering stays stable.
  const last = await db.paymentGateway.findFirst({
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const gateway = await db.paymentGateway.create({
    data: { ...data, provider, config, position: (last?.position ?? -1) + 1 },
    select: { id: true },
  });
  await setCurrencies(gateway.id, currencyIds);

  revalidatePath("/admin/gateways");
  redirect("/admin/gateways");
}

/**
 * Configure an existing gateway. The provider key is read from the stored row,
 * not the form — it can't be changed after creation.
 */
export async function updateGateway(
  _prev: GatewayFormState,
  formData: FormData
): Promise<GatewayFormState> {
  await requireSession();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { error: "Pasarela inválida." };

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const current = await db.paymentGateway.findUnique({
    where: { id },
    select: { provider: true, config: true },
  });
  if (!current) return { error: "La pasarela no existe." };

  const { currencyIds, ...data } = parsed.data;
  const previous = decryptConfig(current.config);
  const config = buildConfig(current.provider, formData, previous);

  await db.paymentGateway.update({ where: { id }, data: { ...data, config } });
  await setCurrencies(id, currencyIds);

  revalidatePath("/admin/gateways");
  redirect("/admin/gateways");
}

/** Quick enable/disable toggle from the list. */
export async function toggleGateway(id: string, enabled: boolean): Promise<void> {
  await requireSession();
  await db.paymentGateway.update({ where: { id }, data: { enabled } });
  revalidatePath("/admin/gateways");
}

/**
 * Delete a gateway instance. Orders keep their history: the FK is `SetNull`,
 * so past orders simply lose the live link to the deleted gateway.
 */
export async function deleteGateway(id: string): Promise<{ error?: string }> {
  await requireSession();
  await db.paymentGateway.delete({ where: { id } });
  revalidatePath("/admin/gateways");
  return {};
}
