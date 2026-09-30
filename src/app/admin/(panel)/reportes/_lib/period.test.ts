import assert from "node:assert/strict";
import { test } from "node:test";
import { getReportPeriod, periodBuckets, changePercent } from "./period";

test("el mes predeterminado y el día actual se calculan en Argentina", () => {
  const period = getReportPeriod({}, new Date("2026-10-01T01:00:00Z"));
  assert.equal(period.desde, "2026-09-01");
  assert.equal(period.hasta, "2026-09-30");
  assert.equal(period.end.toISOString(), "2026-10-01T03:00:00.000Z");
  assert.equal(period.previousStart.toISOString(), "2026-08-02T03:00:00.000Z");
});

test("los rangos incluyen hasta y la comparación tiene igual duración", () => {
  const period = getReportPeriod({ desde: "2024-02-29", hasta: "2024-03-01" });
  assert.equal(period.days, 2);
  assert.equal(period.start.toISOString(), "2024-02-29T03:00:00.000Z");
  assert.equal(period.end.toISOString(), "2024-03-02T03:00:00.000Z");
  assert.equal(period.previousStart.toISOString(), "2024-02-27T03:00:00.000Z");
  assert.deepEqual(periodBuckets(period), ["2024-02-29", "2024-03-01"]);
});

test("rechaza fechas inválidas, rangos invertidos y consultas mayores a 366 días", () => {
  for (const params of [
    { desde: "2026-02-29" }, { hasta: "no" },
    { desde: "2026-09-30", hasta: "2026-09-01" },
    { desde: "2024-01-01", hasta: "2025-01-01" },
  ]) assert.throws(() => getReportPeriod(params));
});

test("agrupa por mes los períodos largos y evita dividir por cero", () => {
  assert.deepEqual(periodBuckets(getReportPeriod({ desde: "2026-01-01", hasta: "2026-03-31" })), ["2026-01", "2026-02", "2026-03"]);
  assert.equal(changePercent(10, 0), null);
  assert.equal(changePercent(150, 100), 50);
  assert.equal(changePercent(0, 100), -100);
});
