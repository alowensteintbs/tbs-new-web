import { db } from "@/lib/db";
import { getProductLandings } from "@/lib/product-landings.server";
import type {
  EnabledCurrency,
  CategoryOption,
  LandingOption,
} from "../_components/product-form";

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

export async function getAvailableLandingOptions(
  currentProductId?: string
): Promise<LandingOption[]> {
  const assigned = await db.product.findMany({
    where: currentProductId ? { NOT: { id: currentProductId } } : undefined,
    select: { landingSlug: true },
  });
  const assignedSlugs = new Set(assigned.map((product) => product.landingSlug));
  const landings = await getProductLandings();

  return landings.filter((landing) => !assignedSlugs.has(landing.slug)).map(
    (landing) => ({ ...landing })
  );
}
