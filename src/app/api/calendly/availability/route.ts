import { z } from "zod";
import { CalendlyConfigurationError, getCalendlyAvailability } from "@/lib/calendly";

const querySchema = z.object({
  landing: z.string().regex(/^[a-z0-9-]{1,80}$/),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    landing: url.searchParams.get("landing"),
    month: url.searchParams.get("month"),
  });
  if (!parsed.success) {
    return Response.json({ error: "Consulta inválida." }, { status: 400 });
  }
  const [year, month] = parsed.data.month.split("-").map(Number);
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 1));
  // Calendly rechaza rangos cuyo inicio ya quedó unos milisegundos en el pasado
  // cuando la solicitud llega a su API.
  const now = new Date(Date.now() + 60_000);
  const start = monthStart > now ? monthStart : now;
  if (monthEnd <= now) return Response.json({ slots: [] });

  try {
    const slots = await getCalendlyAvailability(
      parsed.data.landing,
      start.toISOString(),
      monthEnd.toISOString(),
    );
    return Response.json({ slots }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof CalendlyConfigurationError) {
      return Response.json({ error: error.message }, { status: 503 });
    }
    console.error("No se pudo consultar la disponibilidad de Calendly", error);
    return Response.json(
      { error: "No pudimos consultar los horarios disponibles." },
      { status: 502 },
    );
  }
}
