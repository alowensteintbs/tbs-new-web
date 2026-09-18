import { z } from "zod";
import {
  CalendlyBookingError,
  CalendlyConfigurationError,
  createCalendlyBooking,
} from "@/lib/calendly";

const bookingSchema = z.object({
  landing: z.string().regex(/^[a-z0-9-]{1,80}$/),
  startTime: z.string().datetime({ offset: true }),
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z.string().trim().regex(/^\+[1-9]\d{6,14}$/),
  timezone: z.string().trim().min(1).max(100),
});

export async function POST(request: Request) {
  const parsed = bookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || new Date(parsed.data?.startTime ?? 0) <= new Date()) {
    return Response.json(
      { error: "Los datos de la reserva no son válidos." },
      { status: 400 },
    );
  }
  try {
    const booking = await createCalendlyBooking({
      landingSlug: parsed.data.landing,
      startTime: parsed.data.startTime,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      timezone: parsed.data.timezone,
    });
    return Response.json({
      ok: true,
      cancelUrl: booking.cancel_url,
      rescheduleUrl: booking.reschedule_url,
    });
  } catch (error) {
    if (error instanceof CalendlyConfigurationError) {
      return Response.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof CalendlyBookingError) {
      return Response.json(
        { error: error.message, refreshAvailability: error.slotUnavailable },
        { status: error.slotUnavailable ? 409 : 502 },
      );
    }
    console.error("No se pudo crear la reserva en Calendly", error);
    return Response.json(
      { error: "No pudimos confirmar la llamada en este momento." },
      { status: 502 },
    );
  }
}
