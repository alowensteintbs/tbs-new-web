import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const load = createRequire(import.meta.url);
load("tsx/cjs");
const { discountedPaymentItems } = load("../src/lib/payments/payment-items.ts");

test("distribuye el descuento y conserva exactamente el total cobrable", () => {
  const items = discountedPaymentItems(
    {
      total: 274.99,
      items: [
        { productName: "Curso A", unitPrice: 199.99, quantity: 1 },
        { productName: "Curso B", unitPrice: 50, quantity: 2 },
      ],
    },
    (amount) => Math.round(amount * 100)
  );

  assert.deepEqual(items, [
    { productName: "Curso A", amount: 18333 },
    { productName: "Curso B", amount: 4583 },
    { productName: "Curso B", amount: 4583 },
  ]);
  assert.equal(items.reduce((sum, item) => sum + item.amount, 0), 27499);
});

test("un pedido de un solo curso envía su precio ya descontado", () => {
  assert.deepEqual(
    discountedPaymentItems(
      {
        total: 180,
        items: [{ productName: "Curso", unitPrice: 200, quantity: 1 }],
      },
      (amount) => Math.round(amount * 100)
    ),
    [{ productName: "Curso", amount: 18000 }]
  );
});
