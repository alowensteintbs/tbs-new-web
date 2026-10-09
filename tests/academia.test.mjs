import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import { beforeEach, after, test } from "node:test";

const load = createRequire(import.meta.url);
load("tsx/cjs");
let order, events, calls, responseBody, statusCode, apiDelay;
const originalFetch = global.fetch;
const originalKey = process.env.TBS_ACADEMY_API_KEY;
const originalUrl = process.env.TBS_ACADEMY_API_URL;
const db = {
  order: {
    findFirst: async () => order && !order.deletedAt && ({ ...order }),
    findUniqueOrThrow: async () => ({ ...order }),
    updateMany: async ({ where, data }) => {
      if (typeof where.status === "string" && order.status !== where.status) return { count: 0 };
      if (where.status?.in && !where.status.in.includes(order.status)) return { count: 0 };
      if (where.deletedAt === null && order.deletedAt) return { count: 0 };
      if (where.academiaToken && order.academiaToken !== where.academiaToken) return { count: 0 };
      if (where.academiaEstado?.not && order.academiaEstado === where.academiaEstado.not) return { count: 0 };
      if (where.academiaEstado?.in && !where.academiaEstado.in.includes(order.academiaEstado)) return { count: 0 };
      if (where.academiaSolicitud === null && order.academiaSolicitud !== null) return { count: 0 };
      if (where.OR && order.academiaBloqueoHasta > new Date()) return { count: 0 };
      const { academiaIntentos, ...fields } = data;
      Object.assign(order, fields);
      if (academiaIntentos) order.academiaIntentos += academiaIntentos.increment;
      return { count: 1 };
    },
  },
  product: { findMany: async () => [{ id: "p1", academyId: "principal" }, { id: "p2", academyId: "adicional" }] },
  orderEvent: { create: async ({ data }) => { events.push(data); return data; } },
  $transaction: async (fn) => fn(db),
};
const originalLoad = Module._load;
Module._load = function(request, ...args) {
  if (request === "server-only") return {};
  if (request === "@/lib/db") return { db };
  return originalLoad.call(this, request, ...args);
};
const api = load("../src/lib/academia/api.ts");
const { procesarInscripcionAcademia } = load("../src/lib/academia/inscripcion.ts");
Module._load = originalLoad;

beforeEach(() => {
  process.env.TBS_ACADEMY_API_KEY = "clave-de-prueba";
  process.env.TBS_ACADEMY_API_URL = "https://academia.example.com/api/woocommerce/enroll";
  order = { status: "PAID", deletedAt: null, customer: { email: "actual@example.com", name: "Actual", surname: "Cambio" }, items: [{ productId: "p1" }, { productId: "p2" }] };
  Object.assign(order, { academiaSolicitud: JSON.stringify({ email: "compra@example.com", firstName: "Ana", lastName: "Pérez", courseSlugs: ["principal", "adicional"] }), academiaEstado: "PENDIENTE", academiaIntentos: 0, academiaBloqueoHasta: null });
  events = []; calls = []; statusCode = 200; apiDelay = undefined;
  responseBody = { success: true, userCreated: true, temporaryPassword: "NO_GUARDAR", enrollments: [{ status: "success" }, { status: "already_enrolled" }] };
  global.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    if (apiDelay) await apiDelay();
    return Response.json(responseBody, { status: statusCode });
  };
});
after(() => {
  global.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.TBS_ACADEMY_API_KEY; else process.env.TBS_ACADEMY_API_KEY = originalKey;
  if (originalUrl === undefined) delete process.env.TBS_ACADEMY_API_URL; else process.env.TBS_ACADEMY_API_URL = originalUrl;
});

test("packs y ofertas eliminan slugs duplicados y vacíos", () => {
  assert.deepEqual(api.cursosAcademia([" principal,adicional ", "adicional,,tercero"]), ["principal", "adicional", "tercero"]);
});
test("inscribe con la instantánea del comprador y completa solo una vez", async () => {
  assert.deepEqual(await procesarInscripcionAcademia("pedido"), {});
  assert.equal(order.status, "FULFILLED");
  assert.equal(order.academiaEstado, "COMPLETADA");
  assert.deepEqual(JSON.parse(calls[0].options.body), { email: "compra@example.com", firstName: "Ana", lastName: "Pérez", courseSlugs: ["principal", "adicional"] });
  assert.equal(calls[0].options.headers.Authorization, "Bearer clave-de-prueba");
  assert.equal(JSON.stringify(events).includes("NO_GUARDAR"), false);
  assert.deepEqual(await procesarInscripcionAcademia("pedido"), {});
  assert.equal(calls.length, 1);
});
test("una inscripción parcial mantiene PAID, registra el fallo y permite reintentar", async () => {
  responseBody.enrollments[1].status = "error";
  assert.ok((await procesarInscripcionAcademia("pedido")).error);
  assert.equal(order.status, "PAID"); assert.equal(order.academiaEstado, "ERROR");
  assert.equal(events[0].type, "ACADEMIA_ERROR");
  responseBody.enrollments[1].status = "already_enrolled";
  assert.deepEqual(await procesarInscripcionAcademia("pedido"), {});
  assert.equal(order.academiaIntentos, 2); assert.equal(order.status, "FULFILLED");
});
test("success global sin todos los resultados no completa el pedido", async () => {
  responseBody.enrollments.pop();
  assert.ok((await procesarInscripcionAcademia("pedido")).error);
  assert.equal(order.status, "PAID");
});
test("dos invocaciones concurrentes realizan una sola inscripción", async () => {
  let release, started;
  const entered = new Promise((resolve) => { started = resolve; });
  apiDelay = () => new Promise((resolve) => { release = resolve; started(); });
  const first = procesarInscripcionAcademia("pedido");
  await entered;
  assert.ok((await procesarInscripcionAcademia("pedido")).error);
  release(); await first;
  assert.equal(calls.length, 1);
});
test("un bloqueo vencido se puede recuperar", async () => {
  order.academiaEstado = "PROCESANDO"; order.academiaBloqueoHasta = new Date(0);
  assert.deepEqual(await procesarInscripcionAcademia("pedido"), {});
  assert.equal(order.status, "FULFILLED");
});
test("un reembolso durante la API no vuelve a FULFILLED", async () => {
  apiDelay = async () => { order.status = "REFUNDED"; };
  await procesarInscripcionAcademia("pedido");
  assert.equal(order.status, "REFUNDED"); assert.equal(order.academiaEstado, "COMPLETADA");
});
test("pedidos no pagados y archivados no otorgan acceso", async () => {
  order.status = "PENDING";
  assert.ok((await procesarInscripcionAcademia("pedido")).error);
  assert.equal(calls.length, 0);
});
test("HTTP 401 queda registrado sin guardar la respuesta privada", async () => {
  statusCode = 401;
  assert.match((await procesarInscripcionAcademia("pedido")).error, /401/);
  assert.equal(order.academiaEstado, "ERROR"); assert.equal(order.academiaToken, null);
  assert.equal(JSON.stringify(events).includes("NO_GUARDAR"), false);
});
test("error de red libera el bloqueo y conserva el pago", async () => {
  global.fetch = async () => { throw new Error("error con credenciales privadas"); };
  assert.ok((await procesarInscripcionAcademia("pedido")).error);
  assert.equal(order.status, "PAID"); assert.equal(order.academiaBloqueoHasta, null);
  assert.equal(JSON.stringify(events).includes("credenciales privadas"), false);
});
test("sin credenciales falla de forma visible y no llama a la API", async () => {
  delete process.env.TBS_ACADEMY_API_KEY;
  assert.match((await procesarInscripcionAcademia("pedido")).error, /TBS_ACADEMY_API_KEY/);
  assert.equal(calls.length, 0); assert.equal(order.status, "PAID");
});
test("pedidos anteriores toman los cursos de todas las líneas", async () => {
  order.academiaSolicitud = null;
  assert.deepEqual(await procesarInscripcionAcademia("pedido"), {});
  assert.deepEqual(JSON.parse(calls[0].options.body).courseSlugs, ["principal", "adicional"]);
});
test("una configuración legacy incompleta se puede reparar y reintentar", async () => {
  order.academiaSolicitud = null; order.academiaEstado = "ERROR";
  assert.deepEqual(await procesarInscripcionAcademia("pedido"), {});
  assert.deepEqual(JSON.parse(order.academiaSolicitud).courseSlugs, ["principal", "adicional"]);
  assert.equal(order.academiaEstado, "COMPLETADA");
});
test("comprueba acceso por GET y valida hasAccess", async () => {
  responseBody = { hasAccess: true };
  assert.equal(await api.tieneAccesoAcademia("a+b@example.com", "curso-uno"), true);
  const url = new URL(calls[0].url);
  assert.equal(url.searchParams.get("email"), "a+b@example.com");
  assert.equal(url.searchParams.get("courseSlug"), "curso-uno");
  responseBody = {};
  await assert.rejects(api.tieneAccesoAcademia("a@example.com", "curso"));
});
