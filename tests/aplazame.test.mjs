import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import { test } from "node:test";

const load = createRequire(import.meta.url);
const originalLoad = Module._load;
Module._load = function loadModule(request, ...args) {
  if (request === "server-only") return {};
  return originalLoad.call(this, request, ...args);
};
load("tsx/cjs");
const { aplazameAdapter } = load("../src/lib/payments/adapters/aplazame.ts");
const { getProvider } = load("../src/lib/payments/providers.ts");
Module._load = originalLoad;

const config = {
  publicKey: "aplazame-sandbox-public-key",
  privateKey: "aplazame-sandbox-key",
};
const ctx = {
  baseUrl: "https://shop.example.com",
  checkoutUrl: "https://shop.example.com/checkout/product-1",
  gatewayId: "aplazame-gateway",
  live: false,
};
const order = {
  id: "order-1",
  number: "TBS-000001",
  total: 199.9,
  currencyCode: "EUR",
  customer: {
    email: "buyer@example.com",
    name: "Ada",
    surname: "Lovelace",
    phone: "+34600111222",
    country: "ES",
    addressLine: "Calle Mayor 1",
    city: "Madrid",
    province: "Madrid",
    postalCode: "28001",
  },
  items: [{ productName: "Curso", unitPrice: 199.9, quantity: 1 }],
};

function callback({ status = "pending", status_reason = "confirmation_required" } = {}) {
  return JSON.stringify({
    id: "aplazame-payment-1",
    status,
    status_reason,
    mid: "order-1",
    total_amount: 19990,
    currency: { code: "EUR" },
  });
}

test("crea el checkout Aplazame v4 y devuelve su Location", async () => {
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, "https://api.aplazame.com/checkout");
    assert.equal(options.redirect, "manual");
    assert.equal(options.headers.Accept, "application/vnd.aplazame.sandbox.v4+json");
    assert.equal(options.headers.Authorization, "Bearer aplazame-sandbox-key");
    const body = JSON.parse(options.body);
    assert.equal(body.order.total_amount, 19990);
    assert.equal(body.order.currency, "EUR");
    assert.equal(body.merchant.notification_url, "https://shop.example.com/api/payments/webhook/aplazame-gateway");
    return new Response(null, { status: 201, headers: { Location: "https://checkout.aplazame.com/token" } });
  };
  try {
    assert.deepEqual(await aplazameAdapter.createPayment(order, config, ctx), {
      kind: "redirect",
      url: "https://checkout.aplazame.com/token",
    });
  } finally {
    global.fetch = originalFetch;
  }
});

test("envía a Aplazame el total rebajado por el cupón", async () => {
  const originalFetch = global.fetch;
  global.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    assert.equal(body.order.total_amount, 18000);
    assert.equal(body.order.articles[0].price, 18000);
    return new Response(null, { status: 201, headers: { Location: "https://checkout.aplazame.com/token" } });
  };
  try {
    await aplazameAdapter.createPayment({ ...order, total: 180 }, config, ctx);
  } finally {
    global.fetch = originalFetch;
  }
});

test("el admin solicita las claves pública y privada y permite elegir modalidad", () => {
  const fields = getProvider("aplazame").fields;
  assert.deepEqual(fields.map((field) => field.key), ["publicKey", "privateKey", "productType"]);
  assert.equal(fields.find((field) => field.key === "privateKey").secret, true);
  assert.notEqual(fields.find((field) => field.key === "publicKey").secret, true);
});

test("abre el checkout alojado cuando Aplazame devuelve su id en JSON", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => Response.json({ id: "checkout-id-123" }, { status: 201 });
  try {
    const result = await aplazameAdapter.createPayment(order, config, ctx);
    assert.equal(result.kind, "redirect");
    assert.equal(result.paymentRef, "checkout-id-123");
    const url = new URL(result.url);
    assert.equal(url.origin, "https://checkout.aplazame.com");
    assert.equal(url.searchParams.get("order"), "checkout-id-123");
    assert.equal(url.searchParams.get("public-key"), "aplazame-sandbox-public-key");
    assert.equal(url.searchParams.get("sandbox"), "true");
  } finally {
    global.fetch = originalFetch;
  }
});

test("explica que falta la clave pública si Aplazame devuelve un id", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => Response.json({ id: "checkout-id-123" }, { status: 201 });
  try {
    await assert.rejects(
      aplazameAdapter.createPayment(order, { privateKey: config.privateKey }, ctx),
      /falta la clave pública/
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test("confirma solo una notificación autenticada con pedido, importe y moneda", async () => {
  const result = await aplazameAdapter.handleWebhook(
    callback(),
    new Headers({ Authorization: "Bearer aplazame-sandbox-key" }),
    config,
    ctx
  );
  assert.equal(result.status, "PENDING");
  assert.deepEqual(result.verifiedPayment, {
    gatewayId: "aplazame-gateway",
    amount: 199.9,
    currency: "EUR",
  });
  assert.equal(result.ack.body, '{"status":"ok"}');
});

test("rechaza una notificación sin los datos necesarios para validar el pago", async () => {
  const result = await aplazameAdapter.handleWebhook(
    JSON.stringify({ id: "aplazame-payment-1", status: "ok", mid: "order-1" }),
    new Headers({ Authorization: "Bearer aplazame-sandbox-key" }),
    config,
    ctx
  );
  assert.equal(result.status, undefined);
  assert.equal(result.ack.body, '{"status":"ko"}');
});

test("rechaza callbacks sin la autenticación Bearer de Aplazame", async () => {
  await assert.rejects(
    aplazameAdapter.handleWebhook(callback(), new Headers(), config, ctx),
    /webhook inválida/
  );
});
