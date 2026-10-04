import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import { beforeEach, test } from "node:test";

const load = createRequire(import.meta.url);
load("tsx/cjs");
const { Prisma } = load("../src/generated/prisma/client.ts");
const decimal = (value) => new Prisma.Decimal(value);
let fixture, created, payable, customerWrites;
const currency = { id: "eur", code: "EUR", name: "Euro", symbol: "€", countryCodes: "ES", enabled: true };
const product = { id: "main", name: "Curso principal", sku: "MAIN", visible: true, prices: [{ amount: decimal("199.99") }] };
function makeOffer(id = "offer-1", amount = "33.00") {
  return { id, titulo: "Añade otra formación", descripcion: "", activo: true,
    productoPrincipalId: "main", productoOfrecidoId: `extra-${id}`,
    productoOfrecido: { id: `extra-${id}`, name: `Adicional ${id}`, sku: "EXTRA", visible: true },
    prices: [{ amount: decimal(amount) }],
  };
}
const db = {
  product: { findUnique: async () => fixture.product, findFirst: async () => fixture.product?.visible ? fixture.product : null },
  currency: {
    findFirst: async ({ where }) => where.id === "eur" && fixture.currency.enabled ? fixture.currency : null,
    findMany: async () => fixture.currency.enabled ? [fixture.currency] : [],
  },
  ofertaCheckout: { findMany: async ({ where }) => {
    assert.equal(where.activo, true);
    assert.deepEqual(where.productoOfrecido, { visible: true });
    assert.equal(where.prices.some.currency.enabled, true);
    assert.equal(where.prices.some.amount.gte, 0);
    return fixture.offers.filter((offer) => (!where.id || where.id.in.includes(offer.id))
      && offer.productoPrincipalId === where.productoPrincipalId && offer.activo && offer.productoOfrecido.visible
      && offer.productoOfrecidoId !== where.NOT.productoOfrecidoId && offer.prices.length > 0
      && Number(offer.prices[0].amount) >= 0 && where.prices.some.currencyId === "eur" && fixture.currency.enabled);
  } },
  paymentGateway: { findFirst: async () => ({ id: "manual", provider: "manual", config: "{}", live: false }) },
  coupon: { findUnique: async () => fixture.coupon },
  customer: { upsert: async ({ create }) => { customerWrites += 1; return { id: "buyer", ...create }; } },
  order: {
    count: async () => fixture.couponUses,
    create: async ({ data }) => { created = data; return { id: "order-1", seq: 1 }; },
    update: async ({ data }) => ({ id: "order-1", number: data.number, total: created.total,
      status: created.status, currency: { code: "EUR" }, items: created.items.create }),
  },
  orderEvent: { create: async () => ({}) },
  $transaction: async (operation) => typeof operation === "function" ? operation(db) : Promise.all(operation),
};
const originalLoad = Module._load;
Module._load = function(request, ...args) {
  if (request === "server-only") return {};
  if (request === "@/lib/db") return { db };
  if (request === "@/lib/env") return { getSiteUrl: () => "https://shop.example.com" };
  if (request === "@/lib/payments/checkout") return {
    getGatewaysForCurrency: async () => [{ id: "manual", provider: "manual", name: "Transferencia", description: "" }],
    readGatewayConfig: () => ({}), formatOrderNumber: (seq) => `TBS-${String(seq).padStart(6, "0")}`,
  };
  if (request === "@/lib/payments") return { getAdapter: () => ({
    createPayment: async (order) => { payable = order; return { kind: "internal" }; },
  }) };
  if (request === "@/lib/email/notify") return { sendOrderStatusEmail: async () => {} };
  return originalLoad.call(this, request, ...args);
};
const { placeOrder, previewCoupon, getCheckoutQuote } = load("../src/app/(public)/checkout/actions.ts");
const { getCheckoutOffers, resolveOrderBumps } = load("../src/lib/order-bumps.ts");
Module._load = originalLoad;

beforeEach(() => {
  fixture = { currency: { ...currency }, product: { ...product }, offers: [makeOffer()], coupon: null, couponUses: 0 };
  created = undefined; payable = undefined; customerWrites = 0;
});
function form(ids = []) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ productId: "main", currencyId: "eur", gatewayId: "manual",
    email: "buyer@example.com", name: "Ada", surname: "Test", phone: "600111222", addressLine: "Calle Mayor 1",
    city: "Madrid", postalCode: "28001", province: "Madrid", country: "ES", terms: "accepted",
  })) data.set(key, value);
  for (const id of ids) data.append("ofertaId", id);
  return data;
}
function coupon(percent = 10) {
  fixture.coupon = { id: "coupon-1", code: "TEST", type: "PERCENTAGE", percent: decimal(percent), amount: null,
    currencyId: null, minAmount: null, maxUses: null, oncePerCustomer: false,
    startsAt: null, endsAt: null, enabled: true, products: [{ productId: "main" }],
  };
}
test("sin ofertas mantiene una sola línea y el precio original", async () => {
  assert.deepEqual(await placeOrder({}, form()), { internal: { orderId: "order-1", orderNumber: "TBS-000001" } });
  assert.equal(created.items.create.length, 1);
  assert.equal(created.total.toString(), "199.99");
  assert.equal(created.items.create[0].origen, "PRINCIPAL");
});
test("usa el precio especial del servidor e ignora importes manipulados", async () => {
  const data = form(["offer-1"]);
  data.set("amount", "0.01"); data.set("discountAmount", "99999"); data.set("price_offer-1", "0");
  await placeOrder({}, data);
  assert.equal(created.subtotal.toString(), "232.99");
  assert.equal(payable.total.toString(), "232.99");
  assert.equal(created.items.create[1].unitPrice.toString(), "33");
  assert.equal(created.items.create[1].ofertaId, "offer-1");
  assert.equal(created.items.create[1].origen, "ORDER_BUMP");
});
test("varias ofertas generan líneas independientes sin perder centavos", async () => {
  fixture.offers.push(makeOffer("offer-2", "12.45"));
  await placeOrder({}, form(["offer-1", "offer-2"]));
  assert.equal(created.items.create.length, 3);
  assert.equal(created.total.toString(), "245.44");
});
test("el cupón descuenta solo el principal y coincide con la vista previa", async () => {
  coupon();
  const data = form(["offer-1"]); data.set("couponCode", "test");
  const preview = await previewCoupon(data);
  assert.equal(preview.ok, true);
  await placeOrder({}, data);
  assert.equal(created.discountAmount.toString(), "20");
  assert.equal(created.total.toString(), "212.99");
  assert.equal(created.items.create[0].discountAmount.toString(), "20");
  assert.equal(created.items.create[1].discountAmount.toString(), "0");
  assert.equal(preview.totalLabel, new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(212.99));
});
test("un cupón del 100% mantiene pendiente el pedido si quedan bumps por cobrar", async () => {
  coupon(100);
  const data = form(["offer-1"]); data.set("couponCode", "TEST");
  await placeOrder({}, data);
  assert.equal(created.status, "PENDING");
  assert.equal(payable.total.toString(), "33");
});
test("el mínimo del cupón no se alcanza sumando ofertas", async () => {
  coupon(); fixture.coupon.minAmount = decimal(220);
  const data = form(["offer-1"]); data.set("couponCode", "TEST");
  assert.equal((await previewCoupon(data)).ok, false);
  assert.ok((await placeOrder({}, data)).fieldErrors.couponCode);
  assert.equal(customerWrites, 0);
});
test("IDs duplicados o inventados no crean clientes ni pedidos", async () => {
  for (const ids of [["offer-1", "offer-1"], ["unknown"], Array.from({ length: 21 }, (_, index) => `id-${index}`)]) {
    assert.ok((await placeOrder({}, form(ids))).fieldErrors.ofertaIds);
    assert.equal(created, undefined); assert.equal(customerWrites, 0);
  }
});
for (const [scenario, mutate] of [
  ["oferta desactivada", (offer) => { offer.activo = false; }],
  ["producto oculto", (offer) => { offer.productoOfrecido.visible = false; }],
  ["otro producto principal", (offer) => { offer.productoPrincipalId = "other"; }],
  ["sin precio en esta moneda", (offer) => { offer.prices = []; }],
  ["precio negativo heredado", (offer) => { offer.prices[0].amount = decimal(-10); }],
  ["el mismo producto principal", (offer) => { offer.productoOfrecidoId = "main"; }],
]) test(`rechaza ${scenario} y no la ofrece en el checkout`, async () => {
  mutate(fixture.offers[0]);
  assert.deepEqual(await getCheckoutOffers("main", "eur"), []);
  assert.ok((await placeOrder({}, form(["offer-1"]))).fieldErrors.ofertaIds);
  assert.equal(created, undefined);
});
test("una moneda deshabilitada invalida la compra", async () => {
  fixture.currency.enabled = false;
  assert.equal((await placeOrder({}, form(["offer-1"]))).error, "La moneda ya no está disponible.");
  assert.equal(created, undefined);
});
test("la cotización por país incluye ofertas y precios especiales", async () => {
  const quote = await getCheckoutQuote("main", "ES");
  assert.equal(quote.available, true);
  assert.equal(quote.offers[0].amount, 33);
  assert.equal(quote.currencyId, "eur");
});
test("una oferta gratuita conserva su línea a precio cero", async () => {
  fixture.offers[0] = makeOffer("offer-1", "0");
  const result = await resolveOrderBumps("main", "eur", ["offer-1"]);
  assert.equal(result.ok, true);
  assert.equal(result.items[0].unitPrice.toString(), "0");
  assert.equal(result.subtotal.toString(), "0");
});
