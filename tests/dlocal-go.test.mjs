import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import Module, { createRequire } from "node:module";
import { after, test } from "node:test";

const load = createRequire(import.meta.url);

// Next replaces server-only at build time. Stub that marker when importing the
// adapter into this standalone Node test process.
const originalLoad = Module._load;
Module._load = function load(request, ...args) {
  if (request === "server-only") return {};
  return originalLoad.call(this, request, ...args);
};
load("tsx/cjs");
const { dlocalAdapter } = load("../src/lib/payments/adapters/dlocal.ts");
const { matchesVerifiedPayment } = load("../src/lib/payments/verified-payment.ts");
const { getProvider } = load("../src/lib/payments/providers.ts");
Module._load = originalLoad;

const originalFetch = global.fetch;
after(() => { global.fetch = originalFetch; });

const config = { apiKey: "test-api-key", apiSecret: "test-secret" };
const ctx = {
  baseUrl: "https://example.com",
  checkoutUrl: "https://example.com/checkout/product-1",
  gatewayId: "gateway-1",
  live: false,
};
const order = {
  id: "order-1",
  total: 500,
  currencyCode: "BRL",
  customer: { name: "Ada", surname: "Lovelace", email: "ada@example.com", country: "BR" },
};

function notification(paymentId = "DP-54354") {
  const body = JSON.stringify({ payment_id: paymentId });
  const signature = createHmac("sha256", config.apiSecret)
    .update(config.apiKey + body)
    .digest("hex");
  return {
    body,
    headers: new Headers({ Authorization: `V2-HMAC-SHA256, Signature: ${signature}` }),
  };
}

test("crea checkout dLocal Go con API Key y Secret y usa redirect_url", async () => {
  global.fetch = async (url, options) => {
    assert.equal(url, "https://api-sbx.dlocalgo.com/v1/payments");
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Authorization, "Bearer test-api-key:test-secret");
    const body = JSON.parse(options.body);
    assert.equal(body.amount, 500);
    assert.equal(body.currency, "BRL");
    assert.equal(body.country, "BR");
    assert.equal(body.order_id, "order-1");
    assert.equal(body.notification_url, "https://example.com/api/payments/webhook/gateway-1");
    assert.equal(body.success_url, "https://example.com/orders/order-1?paid=1");
    assert.equal(body.back_url, "https://example.com/checkout/product-1");
    return Response.json({ id: "DP-54354", redirect_url: "https://checkout-sbx.dlocalgo.com/validate/token" });
  };

  assert.deepEqual(await dlocalAdapter.createPayment(order, config, ctx), {
    kind: "redirect",
    url: "https://checkout-sbx.dlocalgo.com/validate/token",
    paymentRef: "DP-54354",
  });
});

test("las credenciales antiguas de Payins no sirven para dLocal Go", async () => {
  await assert.rejects(
    dlocalAdapter.createPayment(order, { login: "old-login", transKey: "old-trans", secretKey: "old-secret" }, ctx),
    /faltan API Key y Secret/
  );
});

test("el admin solicita solo las dos credenciales secretas de dLocal Go", () => {
  const fields = getProvider("dlocal").fields;
  assert.deepEqual(fields.map((field) => field.key), ["apiKey", "apiSecret"]);
  assert.equal(fields.every((field) => field.secret), true);
});

test("rechaza webhook con firma incorrecta antes de consultar el pago", async () => {
  global.fetch = () => { throw new Error("No se debe consultar dLocal Go"); };
  const { body } = notification();
  await assert.rejects(
    dlocalAdapter.handleWebhook(body, new Headers({ Authorization: "V2-HMAC-SHA256, Signature: " + "0".repeat(64) }), config, ctx),
    /firma.*inválida/
  );
});

for (const [providerStatus, localStatus] of [
  ["PAID", "PAID"],
  ["REJECTED", "FAILED"],
  ["CANCELLED", "FAILED"],
  ["EXPIRED", "FAILED"],
  ["PENDING", null],
]) {
  test(`consulta pago y interpreta estado ${providerStatus}`, async () => {
    global.fetch = async (url, options) => {
      assert.equal(url, "https://api-sbx.dlocalgo.com/v1/payments/DP-54354");
      assert.equal(options.headers.Authorization, "Bearer test-api-key:test-secret");
      return Response.json({ id: "DP-54354", order_id: "order-1", amount: 500, currency: "BRL", status: providerStatus });
    };
    const { body, headers } = notification();
    const result = await dlocalAdapter.handleWebhook(body, headers, config, ctx);
    if (localStatus === null) {
      assert.equal(result, null);
    } else {
      assert.equal(result.status, localStatus);
      assert.equal(result.orderId, "order-1");
      assert.equal(result.paymentRef, "DP-54354");
      assert.deepEqual(result.verifiedPayment, { gatewayId: "gateway-1", amount: 500, currency: "BRL" });
    }
  });
}

test("rechaza respuesta de consulta que no corresponde al payment_id notificado", async () => {
  global.fetch = async () => Response.json({ id: "DP-otro", order_id: "order-1", amount: 500, currency: "BRL", status: "PAID" });
  const { body, headers } = notification();
  await assert.rejects(dlocalAdapter.handleWebhook(body, headers, config, ctx), /inconsistentes/);
});

test("solo acepta pagos autenticados que coinciden con el pedido local", () => {
  const stored = {
    id: "order-1",
    gatewayId: "gateway-1",
    paymentRef: "DP-54354",
    total: "500.00",
    currency: { code: "BRL" },
  };
  const result = {
    orderId: "order-1",
    paymentRef: "DP-54354",
    verifiedPayment: { gatewayId: "gateway-1", amount: 500, currency: "BRL" },
  };
  assert.equal(matchesVerifiedPayment(stored, result), true);
  assert.equal(matchesVerifiedPayment(stored, { ...result, orderId: "other-order" }), false);
  assert.equal(matchesVerifiedPayment(stored, { ...result, paymentRef: "DP-other" }), false);
  assert.equal(matchesVerifiedPayment(stored, { ...result, verifiedPayment: { ...result.verifiedPayment, gatewayId: "other-gateway" } }), false);
  assert.equal(matchesVerifiedPayment(stored, { ...result, verifiedPayment: { ...result.verifiedPayment, amount: 500.001 } }), false);
  assert.equal(matchesVerifiedPayment(stored, { ...result, verifiedPayment: { ...result.verifiedPayment, currency: "USD" } }), false);
});
