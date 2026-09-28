import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import Module, { createRequire } from "node:module";
import { after, test } from "node:test";

const load = createRequire(import.meta.url);
const originalLoad = Module._load;
Module._load = function loadModule(request, ...args) {
  if (request === "server-only") return {};
  return originalLoad.call(this, request, ...args);
};
load("tsx/cjs");
const { cleoAdapter } = load("../src/lib/payments/adapters/cleo.ts");
const { getProvider } = load("../src/lib/payments/providers.ts");
Module._load = originalLoad;

const originalFetch = global.fetch;
after(() => { global.fetch = originalFetch; });

const config = { secretKey: "sk_test_example", webhookSecret: "whsec_example" };
const ctx = {
  baseUrl: "https://shop.example.com",
  checkoutUrl: "https://shop.example.com/checkout/product-1",
  gatewayId: "cleo-gateway",
  live: false,
};
const order = {
  id: "order-1",
  number: "TBS-000001",
  total: 149990,
  currencyCode: "CLP",
  customer: { email: "buyer@example.com", name: "Ada", country: "CL" },
  items: [{ productName: "Curso", unitPrice: 149990, quantity: 1 }],
};

function callback(sessionId = "b26d5129-146e-459b-9411-3a3800874305") {
  return JSON.stringify({
    callbackId: 8123,
    event: "CHECKOUT_SUCCEEDED",
    payload: { sessionId },
  });
}

test("crea una sesión sandbox de Cleo y usa el checkout_url recibido", async () => {
  global.fetch = async (url, options) => {
    assert.equal(url, "https://sandbox-api-bnpl.cleo.cl/checkout/v1/sessions");
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Authorization, "Bearer sk_test_example");
    const body = JSON.parse(options.body);
    assert.equal(body.amount, 149990);
    assert.equal(body.currency, "CLP");
    assert.equal(body.merchant_order_id, "order-1");
    assert.equal(body.success_url, "https://shop.example.com/orders/order-1?paid=1");
    assert.equal(body.failure_url, "https://shop.example.com/checkout/product-1");
    assert.equal(body.callback_url, "https://shop.example.com/api/payments/webhook/cleo-gateway");
    assert.equal(body.callback_failure_url, body.callback_url);
    assert.equal(body.sign_callback, true);
    return Response.json(
      {
        session_id: "b26d5129-146e-459b-9411-3a3800874305",
        checkout_url: "https://sandbox-merchant-bnpl.cleo.cl/checkout/start/session",
      },
      { status: 201 }
    );
  };

  assert.deepEqual(await cleoAdapter.createPayment(order, config, ctx), {
    kind: "redirect",
    url: "https://sandbox-merchant-bnpl.cleo.cl/checkout/start/session",
    paymentRef: "b26d5129-146e-459b-9411-3a3800874305",
  });
});

test("Cleo solo admite importes enteros en CLP dentro de sus límites", async () => {
  await assert.rejects(
    cleoAdapter.createPayment({ ...order, currencyCode: "USD" }, config, ctx),
    /solo admite pagos en CLP/
  );
  await assert.rejects(
    cleoAdapter.createPayment({ ...order, total: 999.5 }, config, ctx),
    /importe debe ser un entero/
  );
});

test("el admin expone Secret Key y Webhook Signing Secret como secretos", () => {
  const fields = getProvider("cleo").fields;
  assert.deepEqual(fields.map((field) => field.key), ["secretKey", "webhookSecret"]);
  assert.equal(fields.every((field) => field.secret), true);
});

test("rechaza una firma presente que no sea válida", async () => {
  global.fetch = () => { throw new Error("No debe consultar la sesión"); };
  await assert.rejects(
    cleoAdapter.handleWebhook(
      callback(),
      new Headers({ "X-Cleo-Signature": `sha256=${"0".repeat(64)}` }),
      config,
      ctx
    ),
    /firma del callback inválida/
  );
});

for (const [providerStatus, paid, localStatus] of [
  ["CONFIRMED", true, "PAID"],
  ["DENIED", false, "FAILED"],
  ["ERROR", false, "FAILED"],
  ["EXPIRED", false, "FAILED"],
  ["BANK_ONBOARDING", false, null],
]) {
  test(`consulta la sesión y procesa ${providerStatus}`, async () => {
    const rawBody = callback();
    const signature = `sha256=${createHmac("sha256", config.webhookSecret)
      .update(rawBody)
      .digest("hex")}`;
    global.fetch = async (url, options) => {
      assert.equal(
        url,
        "https://sandbox-api-bnpl.cleo.cl/checkout/v1/sessions/b26d5129-146e-459b-9411-3a3800874305"
      );
      assert.equal(options.headers.Authorization, "Bearer sk_test_example");
      return Response.json({
        session_id: "b26d5129-146e-459b-9411-3a3800874305",
        merchant_order_id: "order-1",
        amount: 149990,
        currency: "CLP",
        status: providerStatus,
        paid,
        expired: providerStatus === "EXPIRED",
      });
    };

    const result = await cleoAdapter.handleWebhook(
      rawBody,
      new Headers({ "X-Cleo-Signature": signature }),
      config,
      ctx
    );
    if (localStatus === null) {
      assert.equal(result, null);
    } else {
      assert.equal(result.status, localStatus);
      assert.equal(result.orderId, "order-1");
      assert.equal(result.paymentRef, "b26d5129-146e-459b-9411-3a3800874305");
      assert.deepEqual(result.verifiedPayment, {
        gatewayId: "cleo-gateway",
        amount: 149990,
        currency: "CLP",
      });
    }
  });
}

test("acepta el primer callback sin firma pero siempre consulta la API", async () => {
  global.fetch = async () => Response.json({
    session_id: "b26d5129-146e-459b-9411-3a3800874305",
    merchant_order_id: "order-1",
    amount: 149990,
    currency: "CLP",
    status: "CONFIRMED",
    paid: true,
  });

  const result = await cleoAdapter.handleWebhook(callback(), new Headers(), config, ctx);
  assert.equal(result.status, "PAID");
});

test("rechaza una consulta que no corresponde a la sesión notificada", async () => {
  global.fetch = async () => Response.json({
    session_id: "otra-session",
    merchant_order_id: "order-1",
    amount: 149990,
    currency: "CLP",
    status: "CONFIRMED",
    paid: true,
  });

  await assert.rejects(
    cleoAdapter.handleWebhook(callback(), new Headers(), config, ctx),
    /incompletos o inconsistentes/
  );
});
