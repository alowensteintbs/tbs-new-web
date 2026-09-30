import assert from "node:assert/strict";
import { test } from "node:test";
import { db } from "./db";

test("reutiliza el cliente y el pool entre operaciones en producción sin conectar", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousUrl = process.env.DATABASE_URL;
  const state = globalThis as unknown as { prisma?: unknown };
  const previousClient = state.prisma;
  delete state.prisma;
  Object.assign(process.env, { NODE_ENV: "production", DATABASE_URL: "mysql://test:test@localhost:3306/test" });
  let createdClient: typeof db | undefined;
  try {
    // Leer un delegado inicializa el cliente, pero no ejecuta ninguna consulta.
    const firstOrders = db.order;
    createdClient = state.prisma as typeof db | undefined;
    assert.ok(createdClient, "El cliente debe quedar guardado también en producción");
    assert.equal(db.order, firstOrders);
    void db.customer;
    assert.equal(state.prisma, createdClient);
  } finally {
    await createdClient?.$disconnect();
    if (previousClient === undefined) delete state.prisma;
    else state.prisma = previousClient;
    if (previousNodeEnv === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Object.assign(process.env, { NODE_ENV: previousNodeEnv });
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
  }
});
