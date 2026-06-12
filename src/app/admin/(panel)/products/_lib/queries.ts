import { db } from "@/lib/db";
import type { EnabledCurrency, CategoryOption } from "../_components/product-form";

export function getEnabledCurrencies(): Promise<EnabledCurrency[]> {
  return db.currency.findMany({
    where: { enabled: true },
    orderBy: { code: "asc" },
    select: { id: true, code: true, name: true, symbol: true },
  });
}

export function getCategoryOptions(): Promise<CategoryOption[]> {
  return db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
