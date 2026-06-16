import "./load-env"; // must be first: loads env before src/lib/env.ts runs
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { encrypt } from "../src/lib/crypto";
import { PAYMENT_PROVIDERS } from "../src/lib/payments/providers";

function createClient() {
  const url = new URL(process.env.DATABASE_URL!);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.replace("/", ""),
  });
  return new PrismaClient({ adapter });
}

const prisma = createClient();

async function main() {
  await seedSuperadmin();
  await seedCurrencies();
  await seedGateways();
}

async function seedSuperadmin() {
  const email = "admin@tradersbusinessschool.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Superadmin already exists, skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash("TBS_Admin_2026!", 12);
  await prisma.user.create({
    data: { email, passwordHash, name: "Super Admin", role: "SUPERADMIN" },
  });

  console.log("Superadmin created:", email);
  console.log("Default password: TBS_Admin_2026!");
  console.log("IMPORTANT: Change this password after first login.");
}

const DEFAULT_CURRENCIES = [
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "MXN", name: "Peso mexicano", symbol: "$" },
  { code: "USD", name: "US Dollar", symbol: "$" },
];

async function seedCurrencies() {
  for (const currency of DEFAULT_CURRENCIES) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: {},
      create: currency,
    });
  }
  console.log(`Currencies seeded: ${DEFAULT_CURRENCIES.map((c) => c.code).join(", ")}`);
}

/**
 * One disabled row per supported provider (WooCommerce-style fixed list).
 * The admin fills credentials/currencies and enables them. Existing rows are
 * left untouched so re-seeding never clobbers configured gateways.
 */
async function seedGateways() {
  const emptyConfig = encrypt("{}");
  for (const [i, provider] of PAYMENT_PROVIDERS.entries()) {
    await prisma.paymentGateway.upsert({
      where: { provider: provider.key },
      update: {},
      create: {
        provider: provider.key,
        name: provider.label,
        enabled: false,
        live: false,
        position: i,
        config: emptyConfig,
      },
    });
  }
  console.log(
    `Gateways seeded: ${PAYMENT_PROVIDERS.map((p) => p.key).join(", ")}`
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
