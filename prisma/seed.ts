import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

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
  const email = "admin@tradersbusinessschool.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Superadmin already exists, skipping seed.");
    return;
  }

  const passwordHash = await bcrypt.hash("TBS_Admin_2026!", 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: "Super Admin",
      role: "SUPERADMIN",
    },
  });

  console.log("Superadmin created:", email);
  console.log("Default password: TBS_Admin_2026!");
  console.log("IMPORTANT: Change this password after first login.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
