import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";
import { requireEnv } from "@/lib/env";

function createPrismaClient() {
  const url = new URL(requireEnv("DATABASE_URL"));
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    // En serverless, un pool grande por instancia multiplica rápidamente las
    // conexiones. Un timeout de conexión mayor evita reintentos agresivos
    // mientras MySQL valida el host remoto durante el handshake inicial.
    connectionLimit: 3,
    connectTimeout: 5_000,
    acquireTimeout: 8_000,
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

/**
 * Delay adapter creation until the first real database operation. Importing a
 * route that references `db` therefore does not require DATABASE_URL at build
 * time, while database-backed routes still fail clearly when invoked without it.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
