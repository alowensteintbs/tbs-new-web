import assert from "node:assert/strict";
import { test } from "node:test";
import { getOrderWhere } from "./filters";
import { csvRow } from "./csv";

test("combina los filtros y excluye archivados", () => {
  assert.deepEqual(getOrderWhere({ q: " Ana ", status: "PAID", curso: "curso-1", moneda: "eur", pasarela: "stripe-1" }), {
    deletedAt: null,
    OR: [
      { number: { contains: "Ana" } },
      { customer: { email: { contains: "Ana" } } },
      { customer: { name: { contains: "Ana" } } },
      { customer: { surname: { contains: "Ana" } } },
    ],
    status: "PAID",
    items: { some: { productId: "curso-1" } },
    currencyId: "eur",
    gatewayId: "stripe-1",
  });
});

test("incluye hasta el final del día en Argentina, también al cambiar de mes", () => {
  assert.deepEqual(getOrderWhere({ desde: "2026-09-01", hasta: "2026-09-30" }).createdAt, {
    gte: new Date("2026-09-01T03:00:00Z"),
    lt: new Date("2026-10-01T03:00:00Z"),
  });
  assert.deepEqual(getOrderWhere({ hasta: "2024-02-29" }).createdAt, { lt: new Date("2024-03-01T03:00:00Z") });
});

test("rechaza fechas inexistentes, rangos invertidos y estados desconocidos", () => {
  for (const params of [
    { desde: "2026-02-29" }, { hasta: "2026-13-01" }, { desde: "ayer" },
    { desde: "2026-09-30", hasta: "2026-09-01" }, { status: "UNKNOWN" },
  ]) assert.throws(() => getOrderWhere(params));
});

test("transferencias pendientes filtra por proveedor manual sin depender de una instancia", () => {
  assert.deepEqual(getOrderWhere({ vista: "transferencias-pendientes", moneda: "ars" }), {
    deletedAt: null, currencyId: "ars",
    AND: [{ status: "PENDING" }, { gateway: { provider: "manual" } }],
  });
});

test("el CSV preserva comillas, separadores, acentos y saltos de línea", () => {
  assert.equal(csvRow(['Curso; "Técnico"', "Ana\nPérez", 12.5, null]), '"Curso; ""Técnico""";"Ana\nPérez";"12.5";""\r\n');
});

test("el CSV neutraliza fórmulas de texto sin alterar valores numéricos", () => {
  assert.equal(csvRow(["=1+1", "  @SUM(A1)", "\t+1", "-2", -2]), '"\'=1+1";"\'  @SUM(A1)";"\'\t+1";"\'-2";"-2"\r\n');
});
