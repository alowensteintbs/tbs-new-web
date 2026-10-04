import "server-only";
import { db } from "@/lib/db";

export async function getOfferOptions() {
  const [products, currencies] = await Promise.all([
    db.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.currency.findMany({ where: { enabled: true }, orderBy: { code: "asc" }, select: { id: true, code: true } }),
  ]);
  return { products, currencies };
}
