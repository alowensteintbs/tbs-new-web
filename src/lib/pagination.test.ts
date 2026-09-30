import assert from "node:assert/strict";
import { test } from "node:test";
import { getPagination } from "./pagination";

test("rechaza páginas fraccionarias o no finitas antes de consultar Prisma", () => {
  for (const page of ["1.5", "Infinity", "-1", "0", "no", "9007199254740991"]) {
    assert.deepEqual(getPagination({ page }), { page: 1, pageSize: 20, skip: 0, take: 20 });
  }
  assert.deepEqual(getPagination({ page: "3" }), { page: 3, pageSize: 20, skip: 40, take: 20 });
});
