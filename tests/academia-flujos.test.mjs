import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import { beforeEach, test } from "node:test";

const load = createRequire(import.meta.url);
load("tsx/cjs");
let order, entregas, emails, events, errorEntrega;
const db = {
  user: { findUnique: async () => ({ name: "Admin" }) },
  order: {
    findFirst: async () => ({ ...order }),
    update: async ({ data }) => { Object.assign(order, data); return order; },
    updateMany: async ({ where, data }) => {
      if (where.status && where.status !== order.status) return { count: 0 };
      Object.assign(order, data); return { count: 1 };
    },
  },
  orderEvent: { create: async ({ data }) => { events.push(data); return data; } },
  $transaction: async (fn) => fn(db),
};
const originalLoad = Module._load;
Module._load = function(request, ...args) {
  if (request === "server-only") return {};
  if (request === "@/lib/db") return { db };
  if (request === "@/lib/crypto") return { decrypt: (value) => value };
  if (request === "@/lib/auth/dal") return { requireSession: async () => ({ userId: "admin" }), requireRole: async () => ({ userId: "admin" }) };
  if (request === "next/cache") return { revalidatePath() {} };
  if (request === "@/lib/email/notify") return { sendOrderStatusEmail: async () => { emails++; } };
  if (request === "@/lib/academia/inscripcion") return { procesarInscripcionAcademia: async (id) => {
    assert.equal(id, "pedido"); entregas++;
    if (errorEntrega) return { error: errorEntrega };
    order.status = "FULFILLED"; return {};
  } };
  return originalLoad.call(this, request, ...args);
};
const { applyWebhookResult } = load("../src/lib/payments/checkout.ts");
const { updateOrderStatus, reintentarInscripcionAcademia } = load("../src/app/admin/(panel)/orders/actions.ts");
Module._load = originalLoad;
beforeEach(() => {
  order = { id: "pedido", status: "PENDING", paidAt: null, gatewayId: "gateway", paymentRef: "ref", total: { toString: () => "100" }, currency: { code: "EUR" } };
  entregas = 0; emails = 0; events = []; errorEntrega = undefined;
});
test("pago autenticado inscribe y un webhook repetido no revierte FULFILLED", async () => {
  const result = { status: "PAID", orderId: "pedido", paymentRef: "ref", verifiedPayment: { gatewayId: "gateway", amount: 100, currency: "EUR" } };
  await applyWebhookResult(result);
  assert.equal(order.status, "FULFILLED"); assert.equal(entregas, 1); assert.equal(emails, 1);
  await applyWebhookResult(result);
  assert.equal(order.status, "FULFILLED"); assert.equal(entregas, 1); assert.equal(emails, 1);
});
test("un pago que no coincide con importe no otorga acceso", async () => {
  await applyWebhookResult({ status: "PAID", orderId: "pedido", paymentRef: "ref", verifiedPayment: { gatewayId: "gateway", amount: 200, currency: "EUR" } });
  assert.equal(entregas, 0); assert.equal(order.status, "PENDING");
});
test("fallo de academia deja el webhook pagado y otra notificación reintenta", async () => {
  errorEntrega = "API sin conexión";
  await applyWebhookResult({ status: "PAID", orderId: "pedido" });
  assert.equal(order.status, "PAID"); assert.equal(emails, 1);
  errorEntrega = undefined;
  await applyWebhookResult({ status: "PAID", orderId: "pedido" });
  assert.equal(order.status, "FULFILLED"); assert.equal(entregas, 2); assert.equal(emails, 1);
});
test("webhooks tardíos pendientes no revierten la entrega", async () => {
  order.status = "FULFILLED";
  await applyWebhookResult({ status: "PENDING", orderId: "pedido" });
  assert.equal(order.status, "FULFILLED"); assert.equal(entregas, 0);
});
test("confirmar transferencia manual dispara la misma entrega", async () => {
  await updateOrderStatus("pedido", "PAID");
  assert.equal(order.status, "FULFILLED"); assert.equal(entregas, 1);
  assert.ok(order.paidAt instanceof Date);
});
test("completar manualmente no evita la confirmación de academia", async () => {
  order.status = "PAID"; errorEntrega = "Curso inválido";
  assert.equal((await updateOrderStatus("pedido", "FULFILLED")).error, "Curso inválido");
  assert.equal(order.status, "PAID");
});
test("el reintento del admin devuelve el error de entrega", async () => {
  order.status = "PAID"; errorEntrega = "Sin conexión";
  assert.equal((await reintentarInscripcionAcademia("pedido")).error, "Sin conexión");
});
