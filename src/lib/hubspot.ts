import "server-only";

import { env } from "@/lib/env";
import { getSetting } from "@/lib/settings";
import { HUBSPOT_FORMS, type HubSpotFormKey } from "@/lib/hubspot-config";

const HUBSPOT_SUBMISSIONS_URL =
  "https://api.hsforms.com/submissions/v3/integration";

export type HubSpotUtmParameters = Partial<Record<
  "utm_source" | "utm_medium" | "utm_campaign" | "utm_term" | "utm_content",
  string
>>;

export class HubSpotConfigurationError extends Error {}
export class HubSpotSubmissionError extends Error {}

async function getPortalId(): Promise<string> {
  const portalId = process.env.HUBSPOT_PORTAL_ID?.trim()
    || env.NEXT_PUBLIC_HUBSPOT_ID?.trim()
    || (await getSetting("hubspot_id"))?.trim();

  if (!portalId || !/^\d+$/.test(portalId)) {
    throw new HubSpotConfigurationError(
      "Falta configurar el Portal ID de HubSpot.",
    );
  }
  return portalId;
}

export async function submitHubSpotForm(input: {
  form: HubSpotFormKey;
  name: string;
  email: string;
  phone: string;
  pageUri?: string;
  hutk?: string;
  utm?: HubSpotUtmParameters;
}) {
  const portalId = await getPortalId();
  const definition = HUBSPOT_FORMS[input.form];
  const token = process.env.HUBSPOT_ACCESS_TOKEN?.trim();
  const mode = token ? "secure/submit" : "submit";
  const context = {
    ...(input.hutk ? { hutk: input.hutk } : {}),
    ...(input.pageUri ? { pageUri: input.pageUri } : {}),
    pageName: definition.name,
  };
  const utmFields = Object.entries(input.utm ?? {})
    .filter(([name, value]) =>
      Boolean(value) && (name !== "utm_content" || definition.utmContent),
    )
    .map(([name, value]) => ({
      objectTypeId: "0-1",
      name,
      value: value!,
    }));
  const response = await fetch(
    `${HUBSPOT_SUBMISSIONS_URL}/${mode}/${portalId}/${definition.id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        submittedAt: String(Date.now()),
        fields: [
          { objectTypeId: "0-1", name: "firstname", value: input.name },
          { objectTypeId: "0-1", name: "email", value: input.email },
          { objectTypeId: "0-1", name: "phone", value: input.phone },
          ...utmFields,
        ],
        context,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    },
  );

  if (!response.ok) {
    const providerError = await response.text();
    console.error("HubSpot rechazó el formulario", {
      status: response.status,
      form: input.form,
      providerError,
    });
    throw new HubSpotSubmissionError(
      response.status === 429
        ? "HubSpot está recibiendo demasiadas solicitudes. Inténtalo nuevamente."
        : "No pudimos registrar tus datos en HubSpot.",
    );
  }
}
