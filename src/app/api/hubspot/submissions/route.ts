import type { NextRequest } from "next/server";
import { z } from "zod";
import { HUBSPOT_FORM_KEYS } from "@/lib/hubspot-config";
import {
  HubSpotConfigurationError,
  HubSpotSubmissionError,
  type HubSpotUtmParameters,
  submitHubSpotForm,
} from "@/lib/hubspot";

const UTM_PARAMETERS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

const submissionSchema = z.object({
  form: z.enum(HUBSPOT_FORM_KEYS),
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z.string().trim().regex(/^\+[1-9]\d{6,14}$/),
  consent: z.literal(true),
  website: z.string().max(200).optional(),
});

function pageContext(request: NextRequest): {
  pageUri?: string;
  utm: HubSpotUtmParameters;
} {
  const referer = request.headers.get("referer");
  if (!referer) return { utm: {} };
  try {
    const url = new URL(referer);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return { utm: {} };
    }

    const utm = Object.fromEntries(
      UTM_PARAMETERS.flatMap((name) => {
        const value = url.searchParams.get(name)?.trim().slice(0, 500);
        return value ? [[name, value]] : [];
      }),
    ) as HubSpotUtmParameters;

    return { pageUri: url.toString().slice(0, 2_048), utm };
  } catch {
    return { utm: {} };
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.nextUrl.host) {
        return Response.json({ error: "Origen no permitido." }, { status: 403 });
      }
    } catch {
      return Response.json({ error: "Origen no permitido." }, { status: 403 });
    }
  }

  const parsed = submissionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json(
      { error: "Revisa los datos ingresados e inténtalo nuevamente." },
      { status: 400 },
    );
  }

  if (parsed.data.website) return Response.json({ ok: true });

  try {
    const context = pageContext(request);
    await submitHubSpotForm({
      form: parsed.data.form,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      pageUri: context.pageUri,
      hutk: request.cookies.get("hubspotutk")?.value,
      utm: context.utm,
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof HubSpotConfigurationError) {
      return Response.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof HubSpotSubmissionError) {
      return Response.json({ error: error.message }, { status: 502 });
    }
    console.error("No se pudo enviar el formulario a HubSpot", error);
    return Response.json(
      { error: "No pudimos procesar tu solicitud en este momento." },
      { status: 502 },
    );
  }
}
