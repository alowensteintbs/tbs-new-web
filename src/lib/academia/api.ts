import "server-only";
import { z } from "zod";

export function cursosAcademia(identificadores: string[]): string[] {
  return [...new Set(identificadores.flatMap((value) => value.split(",").map((slug) => slug.trim()).filter(Boolean)))];
}

function configuracion() {
  const key = process.env.TBS_ACADEMY_API_KEY?.trim();
  const url = new URL(process.env.TBS_ACADEMY_API_URL ?? "https://academia.tradersbusinessschool.com/api/woocommerce/enroll");
  if (!key) throw new Error("Falta configurar TBS_ACADEMY_API_KEY en el servidor.");
  if (url.protocol !== "https:") throw new Error("La URL de la academia debe usar HTTPS.");
  return { key, url };
}

async function solicitar(url: URL, key: string, body?: object) {
  let response: Response;
  try {
    response = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(body ? 30_000 : 5_000),
    });
  } catch {
    // No guardar respuestas, credenciales ni contraseñas temporales en logs.
    throw new Error("No se pudo conectar con la academia. Reintentá la inscripción.");
  }
  if (!response.ok) throw new Error(`La academia respondió HTTP ${response.status}.`);
  try { return await response.json() as unknown; }
  catch { throw new Error("La academia devolvió una respuesta inválida."); }
}

export async function tieneAccesoAcademia(email: string, courseSlug: string): Promise<boolean> {
  const { key, url } = configuracion();
  url.searchParams.set("email", email);
  url.searchParams.set("courseSlug", courseSlug);
  const parsed = z.object({ hasAccess: z.boolean() }).safeParse(await solicitar(url, key));
  if (!parsed.success) throw new Error("La academia no pudo confirmar el acceso al curso.");
  return parsed.data.hasAccess;
}

const respuestaInscripcion = z.object({
  success: z.literal(true),
  userCreated: z.boolean().optional(),
  enrollments: z.array(z.object({ status: z.string() })),
});

export const solicitudAcademiaSchema = z.object({
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string(),
  courseSlugs: z.array(z.string().trim().min(1)).min(1),
});

export async function inscribirAcademia(datos: { email: string; firstName: string; lastName: string; courseSlugs: string[] }) {
  const { key, url } = configuracion();
  const parsed = respuestaInscripcion.safeParse(await solicitar(url, key, datos));
  if (!parsed.success || parsed.data.enrollments.length !== datos.courseSlugs.length ||
      parsed.data.enrollments.some((curso) => !["success", "already_enrolled"].includes(curso.status))) {
    throw new Error("La academia no confirmó todos los cursos. Revisá la configuración y reintentá la inscripción.");
  }
  return { usuarioCreado: parsed.data.userCreated === true, cursos: datos.courseSlugs };
}
