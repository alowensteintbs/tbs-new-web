"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";
import { decrypt, encrypt } from "@/lib/crypto";
import { getProvider } from "@/lib/payments/providers";

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
 * Configure an existing gateway. Providers are a fixed, seeded list — they are
 * never created or deleted here, only edited and enabled/disabled. The provider
 * key is read from the stored row, not the form.
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
