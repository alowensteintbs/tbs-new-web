import "server-only";

import { z } from "zod";

const CALENDLY_API_URL = "https://api.calendly.com";
const DEFAULT_LANDING_EVENT_TYPES: Record<string, string> = {
  "pack-premium": "videollamada-gratuita-1",
  acciones: "llamada-gratis-acciones-eeuu",
  cripto: "criptomonedas",
  efa: "videollamada-efa",
  eia: "videollamada-eia",
  eip: "videollamada-eip",
  "finanzas-personales": "videollamada-gratuita-1",
  "inversor-inteligente": "sesion-de-orientacion-personalizada-inversor-inteligente",
  trading: "videollamada-gratuita-1",
  "trading-algoritmico": "clase-trading-algoritmico",
  blog: "videollamada-gratuita-1",
  "guias-gratis": "videollamada-gratuita-1",
  "clases-gratis": "videollamada-gratuita-1",
};

const locationSchema = z.object({
  kind: z.string(),
  location: z.string().optional(),
}).passthrough();

const customQuestionSchema = z.object({
  name: z.string(),
  type: z.string(),
  position: z.number(),
  enabled: z.boolean(),
  required: z.boolean(),
});

const eventTypeSchema = z.object({
  active: z.boolean(),
  name: z.string(),
  scheduling_url: z.string().url(),
  slug: z.string(),
  uri: z.string().url(),
  pooling_type: z.string().nullable().optional(),
  locations: z.array(locationSchema).nullish().transform((value) => value ?? []),
  custom_questions: z.array(customQuestionSchema).nullish().transform((value) => value ?? []),
});

const eventTypesResponseSchema = z.object({
  collection: z.array(eventTypeSchema),
});
const currentUserResponseSchema = z.object({
  resource: z.object({ uri: z.string().url() }),
});
const eventTypeResponseSchema = z.object({ resource: eventTypeSchema });
const availableTimesResponseSchema = z.object({
  collection: z.array(z.object({
    status: z.string(),
    start_time: z.string().datetime({ offset: true }),
  })),
});
const inviteeResponseSchema = z.object({
  resource: z.object({
    uri: z.string(),
    cancel_url: z.string().url().optional(),
    reschedule_url: z.string().url().optional(),
  }),
});

type CalendlyEventType = z.infer<typeof eventTypeSchema>;

export class CalendlyConfigurationError extends Error {}
export class CalendlyBookingError extends Error {
  constructor(message: string, readonly slotUnavailable = false) {
    super(message);
  }
}

function getToken(): string {
  const token = process.env.CALENDLY_API_TOKEN?.trim();
  if (!token) {
    throw new CalendlyConfigurationError(
      "Falta configurar CALENDLY_API_TOKEN en el servidor.",
    );
  }
  return token;
}

async function calendlyGet(path: string, live = false): Promise<unknown> {
  const response = await fetch(`${CALENDLY_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    ...(live ? { cache: "no-store" as const } : { next: { revalidate: 300 } }),
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new CalendlyConfigurationError(
        "Calendly rechazó la credencial o sus permisos.",
      );
    }
    throw new Error(`Calendly respondió con estado ${response.status}.`);
  }
  return response.json();
}

function eventTypeUuid(reference: string): string | null {
  const apiUri = reference.match(/api\.calendly\.com\/event_types\/([^/?#]+)$/i);
  if (apiUri) return apiUri[1];
  if (/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(reference)) {
    return reference;
  }
  if (/^[A-Z0-9]{16}$/.test(reference)) return reference;
  return null;
}

function uuidFromUri(uri: string): string {
  return uri.slice(uri.lastIndexOf("/") + 1);
}

async function getEventTypeByUuid(uuid: string): Promise<CalendlyEventType> {
  const payload = await calendlyGet(`/event_types/${encodeURIComponent(uuid)}`);
  return eventTypeResponseSchema.parse(payload).resource;
}

async function listEventTypes(): Promise<CalendlyEventType[]> {
  const organizationUri = process.env.CALENDLY_ORG_URI?.trim();
  const params = new URLSearchParams({
    active: "true",
    count: "100",
    sort: "name:asc",
  });
  if (organizationUri) {
    params.set("organization", z.url().parse(organizationUri));
  } else {
    const userPayload = await calendlyGet("/users/me");
    params.set(
      "user",
      currentUserResponseSchema.parse(userPayload).resource.uri,
    );
  }
  const payload = await calendlyGet(`/event_types?${params}`);
  return eventTypesResponseSchema.parse(payload).collection;
}

function referenceMatches(eventType: CalendlyEventType, reference: string) {
  const normalized = reference.toLowerCase();
  return eventType.slug.toLowerCase() === normalized ||
    eventType.name.toLowerCase() === normalized ||
    eventType.uri.toLowerCase() === normalized ||
    eventType.scheduling_url.toLowerCase() === normalized;
}

/** Resolves a landing to a complete, active Calendly event type. */
export async function getCalendlyEventType(
  landingSlug: string,
): Promise<CalendlyEventType> {
  const reference = DEFAULT_LANDING_EVENT_TYPES[landingSlug] ?? landingSlug;
  const uuid = eventTypeUuid(reference);
  let eventType: CalendlyEventType | undefined;

  if (uuid && !reference.startsWith("https://calendly.com/")) {
    eventType = await getEventTypeByUuid(uuid);
  } else {
    const eventTypes = await listEventTypes();
    const summary = eventTypes.find((item) => referenceMatches(item, reference));
    const fallback = !DEFAULT_LANDING_EVENT_TYPES[landingSlug] && eventTypes.length === 1
      ? eventTypes[0]
      : undefined;
    const selected = summary ?? fallback;
    if (selected) eventType = await getEventTypeByUuid(uuidFromUri(selected.uri));
  }

  if (!eventType) {
    throw new CalendlyConfigurationError(
      `No hay un evento activo de Calendly configurado para “${landingSlug}”.`,
    );
  }
  if (!eventType.active) {
    throw new CalendlyConfigurationError(
      `El evento de Calendly configurado para “${landingSlug}” está inactivo.`,
    );
  }
  return eventType;
}

export async function getCalendlyAvailability(
  landingSlug: string,
  startTime: string,
  endTime: string,
): Promise<string[]> {
  const eventType = await getCalendlyEventType(landingSlug);
  const params = new URLSearchParams({
    event_type: eventType.uri,
    start_time: startTime,
    end_time: endTime,
  });
  const payload = await calendlyGet(`/event_type_available_times?${params}`, true);
  return availableTimesResponseSchema.parse(payload).collection
    .filter((slot) => slot.status === "available")
    .map((slot) => slot.start_time);
}

function bookingLocation(eventType: CalendlyEventType, phone: string) {
  if (eventType.pooling_type === "round_robin") return undefined;
  const location = eventType.locations[0];
  if (!location) return undefined;
  if (["ask_invitee", "outbound_call"].includes(location.kind)) {
    return { kind: location.kind, location: phone };
  }
  if (["physical", "custom"].includes(location.kind) && location.location) {
    return { kind: location.kind, location: location.location };
  }
  return { kind: location.kind };
}

export async function createCalendlyBooking(input: {
  landingSlug: string;
  startTime: string;
  name: string;
  email: string;
  phone: string;
  timezone: string;
}) {
  const eventType = await getCalendlyEventType(input.landingSlug);
  const phoneQuestions = eventType.custom_questions.filter(
    (question) => question.enabled && (
      question.type === "phone_number" || /tel[eé]fono|phone/i.test(question.name)
    ),
  );
  const unsupportedQuestion = eventType.custom_questions.find(
    (question) => question.enabled && question.required &&
      !phoneQuestions.includes(question),
  );
  if (unsupportedQuestion) {
    throw new CalendlyConfigurationError(
      `El evento de Calendly tiene una pregunta obligatoria no configurada en el formulario: “${unsupportedQuestion.name}”.`,
    );
  }
  const body = {
    event_type: eventType.uri,
    start_time: input.startTime,
    invitee: {
      name: input.name,
      email: input.email,
      timezone: input.timezone,
      ...(phoneQuestions.some((question) => question.type === "phone_number")
        ? { text_reminder_number: input.phone }
        : {}),
    },
    location: bookingLocation(eventType, input.phone),
    questions_and_answers: phoneQuestions.map((question) => ({
      question: question.name,
      answer: input.phone,
      position: question.position,
    })),
    tracking: { utm_source: "tbs-web", utm_campaign: input.landingSlug },
  };
  const response = await fetch(`${CALENDLY_API_URL}/invitees`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new CalendlyConfigurationError(
        "Calendly rechazó la credencial, sus permisos o el plan contratado.",
      );
    }
    const providerError = await response.text();
    const slotUnavailable = response.status === 409 ||
      /start.?time|available|slot|occupied/i.test(providerError);
    if (slotUnavailable) {
      throw new CalendlyBookingError(
        "Ese horario acaba de dejar de estar disponible. Elige otro.",
        true,
      );
    }
    if (response.status === 400 || response.status === 422) {
      throw new CalendlyBookingError(
        "Calendly rechazó la reserva. Revisa la configuración del tipo de evento.",
      );
    }
    throw new CalendlyBookingError(
      "Calendly no pudo confirmar la llamada en este momento.",
    );
  }
  return inviteeResponseSchema.parse(await response.json()).resource;
}
