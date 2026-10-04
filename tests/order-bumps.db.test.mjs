import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { test } from "node:test";

// Explicit opt-in: exercise the configured database inside a rolled-back
// transaction. No provider requests or transactional emails are sent.
test("checkout y administración con MySQL real, sin conservar datos de prueba", {
  skip: process.env.ORDER_BUMP_DB_TEST !== "1",
}, async () => {
  const load = createRequire(import.meta.url);
  load("tsx/cjs");
  load("dotenv").config({ quiet: true });
  let scopedDb;
  const originalLoad = Module._load;
  const redirect = (url) => { throw new Error(`TEST_REDIRECT:${url}`); };
  Module._load = function(request, ...args) {
    if (request === "server-only") return {};
    if (request === "@/lib/db") return { db: new Proxy({}, { get: (_, key) => scopedDb[key] }) };
    if (request === "next/navigation") return { redirect };
    if (request === "next/cache") return { revalidatePath() {}, unstable_cache: (fn) => fn };
    if (request === "@/lib/auth/dal") return { requireRole: async () => ({ role: "ADMIN" }) };
    if (request === "@/lib/email/notify") return { sendOrderStatusEmail: async () => {} };
    return originalLoad.call(this, request, ...args);
  };
  const { db } = load("../src/lib/db.ts");
  const { placeOrder, previewCoupon } = load("../src/app/(public)/checkout/actions.ts");
  const { getCheckoutOffers } = load("../src/lib/order-bumps.ts");
  const { saveOffer } = load("../src/app/admin/(panel)/order-bumps/actions.ts");
  const { getReportMetrics } = load("../src/app/admin/(panel)/reportes/_lib/metrics.ts");
  Module._load = originalLoad;
  const marker = randomUUID();
  const email = `qa-${marker}@example.com`;
  const rollback = new Error("ROLLBACK_ORDER_BUMP_TEST");
  try {
    await assert.rejects(db.$transaction(async (tx) => {
      scopedDb = new Proxy(tx, { get(target, key) {
        if (key === "$transaction") return async (operation) => typeof operation === "function"
          ? operation(scopedDb) : Promise.all(operation);
        const value = Reflect.get(target, key);
        return typeof value === "function" ? value.bind(target) : value;
      } });
      const currency = await tx.currency.findFirstOrThrow({ where: { enabled: true, code: "EUR" } });
      const main = await tx.product.create({ data: { name: `QA principal ${marker}`, landingSlug: `qa-main-${marker}`,
        description: "", visible: true, prices: { create: { currencyId: currency.id, amount: "199.99" } } } });
      const extra = await tx.product.create({ data: { name: `QA adicional ${marker}`, landingSlug: `qa-extra-${marker}`,
        description: "", visible: true } });
      const gateway = await tx.paymentGateway.create({ data: { provider: "manual", name: "QA sin cobro", config: "{}", live: false,
        currencies: { create: { currencyId: currency.id } } } });
      const offer = await tx.ofertaCheckout.create({ data: { productoPrincipalId: main.id, productoOfrecidoId: extra.id,
        titulo: "QA oferta", descripcion: "", activo: true, prices: { create: { currencyId: currency.id, amount: "33" } } } });
      await tx.coupon.create({ data: { code: `QA-${marker}`, type: "PERCENTAGE", percent: 10,
        products: { create: { productId: main.id } } } });
      const data = new FormData();
      for (const [key, value] of Object.entries({ productId: main.id, currencyId: currency.id, gatewayId: gateway.id,
        email, name: "QA", surname: "OrderBump", phone: "600111222", addressLine: "Calle QA 1", city: "Madrid",
        province: "Madrid", postalCode: "28001", country: "ES", terms: "accepted", couponCode: `QA-${marker}`,
      })) data.set(key, value);
      data.append("ofertaId", offer.id);
      const available = await getCheckoutOffers(main.id, currency.id);
      assert.equal(available.length, 1); assert.equal(available[0].amount, 33);
      const preview = await previewCoupon(data);
      assert.equal(preview.ok, true);
      const result = await placeOrder({}, data);
      assert.ok(result.internal);
      const order = await tx.order.findUniqueOrThrow({ where: { id: result.internal.orderId }, include: { items: true } });
      assert.equal(order.total.toString(), "212.99"); assert.equal(order.subtotal.toString(), "232.99");
      assert.equal(order.status, "PENDING"); assert.equal(order.items.length, 2);
      const bump = order.items.find((item) => item.origen === "ORDER_BUMP");
      assert.equal(bump.ofertaId, offer.id); assert.equal(bump.unitPrice.toString(), "33");
      assert.equal(bump.discountAmount.toString(), "0");

      await tx.order.update({ where: { id: order.id }, data: { status: "PAID", paidAt: new Date() } });
      const reports = await getReportMetrics({ start: new Date(Date.now() - 60_000), end: new Date(Date.now() + 60_000),
        previousStart: new Date(Date.now() - 120_000), monthly: false }, currency.id);
      assert.equal(reports.courses.find((course) => course.name === main.name).revenue, 179.99);
      assert.equal(reports.courses.find((course) => course.name === extra.name).revenue, 33);
      await tx.orderItem.updateMany({ where: { orderId: order.id }, data: { discountAmount: null } });
      const legacyReports = await getReportMetrics({ start: new Date(Date.now() - 60_000), end: new Date(Date.now() + 60_000),
        previousStart: new Date(Date.now() - 120_000), monthly: false }, currency.id);
      assert.ok(Math.abs(legacyReports.courses.find((course) => course.name === extra.name).revenue - 212.99 * 33 / 232.99) < 0.0001);
      await tx.orderItem.updateMany({ where: { orderId: order.id, origen: "PRINCIPAL" }, data: { discountAmount: 20 } });
      await tx.orderItem.updateMany({ where: { orderId: order.id, origen: "ORDER_BUMP" }, data: { discountAmount: 0 } });

      const adminData = new FormData();
      for (const [key, value] of Object.entries({ id: offer.id, productoPrincipalId: main.id, productoOfrecidoId: extra.id,
        titulo: "QA precio editado", descripcion: "Descripción QA", activo: "on", posicion: "2", [`price_${currency.id}`]: "41.25",
      })) adminData.set(key, value);
      await assert.rejects(saveOffer({}, adminData), /TEST_REDIRECT:\/admin\/order-bumps/);
      assert.equal((await getCheckoutOffers(main.id, currency.id))[0].amount, 41.25);
      // Editing a source price must never rewrite historical purchase snapshots.
      assert.equal((await tx.orderItem.findUniqueOrThrow({ where: { id: bump.id } })).unitPrice.toString(), "33");
      adminData.set("productoOfrecidoId", main.id);
      assert.ok((await saveOffer({}, adminData)).fieldErrors.productoOfrecidoId);
      adminData.set("productoOfrecidoId", extra.id);
      adminData.set(`price_${currency.id}`, "1.234");
      assert.ok((await saveOffer({}, adminData)).error);
      adminData.set(`price_${currency.id}`, "41.25");
      adminData.delete("id");
      assert.match((await saveOffer({}, adminData)).error, /Ya existe una oferta/);
      const extraNew = await tx.product.create({ data: { name: `QA nuevo ${marker}`, landingSlug: `qa-new-${marker}`, description: "" } });
      adminData.set("productoOfrecidoId", extraNew.id);
      adminData.delete("activo");
      await assert.rejects(saveOffer({}, adminData), /TEST_REDIRECT:\/admin\/order-bumps/);
      assert.equal(await tx.ofertaCheckout.count({ where: { productoPrincipalId: main.id, productoOfrecidoId: extraNew.id, activo: false } }), 1);

      const orderCount = await tx.order.count();
      await tx.ofertaCheckout.update({ where: { id: offer.id }, data: { activo: false } });
      assert.deepEqual(await getCheckoutOffers(main.id, currency.id), []);
      assert.ok((await placeOrder({}, data)).fieldErrors.ofertaIds);
      assert.equal(await tx.order.count(), orderCount);
      await tx.ofertaCheckout.update({ where: { id: offer.id }, data: { activo: true } });
      await tx.product.update({ where: { id: extra.id }, data: { visible: false } });
      assert.ok((await placeOrder({}, data)).fieldErrors.ofertaIds);
      await tx.product.update({ where: { id: extra.id }, data: { visible: true } });
      await tx.ofertaCheckoutPrice.deleteMany({ where: { ofertaId: offer.id } });
      assert.ok((await placeOrder({}, data)).fieldErrors.ofertaIds);
      // Deleting an offer preserves the purchased product/name/price.
      await tx.ofertaCheckout.delete({ where: { id: offer.id } });
      const history = await tx.orderItem.findUniqueOrThrow({ where: { id: bump.id } });
      assert.equal(history.ofertaId, null); assert.equal(history.productName, extra.name);
      assert.equal(history.unitPrice.toString(), "33");
      throw rollback;
    }, { timeout: 30_000 }), (error) => error === rollback);
    assert.equal(await db.customer.count({ where: { email } }), 0);
    assert.equal(await db.product.count({ where: { landingSlug: { contains: marker } } }), 0);
  } finally { await db.$disconnect(); }
});
