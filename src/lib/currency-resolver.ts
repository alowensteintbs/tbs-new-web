import { cookies } from "next/headers";
import { getEnabledCurrencies, type CatalogCurrency } from "@/lib/catalog";

const COUNTRY_COOKIE = "tbs_country";
const FALLBACK_CODE = "EUR";

export type ActiveCurrency = {
  id: string;
  code: string;
  name: string;
  symbol: string;
};

/**
 * Resolve the active currency for a country code, given the (cached) list of
 * enabled currencies. Matches the currency whose `countryCodes` CSV contains
 * the country; falls back to EUR (or the first currency). Pure function — no
 * cookies/DB — so callers control caching.
 */
export function resolveCurrency(
  currencies: CatalogCurrency[],
  country?: string
): ActiveCurrency | null {
  if (currencies.length === 0) return null;

  const cc = country?.trim().toUpperCase();
  if (cc) {
    const match = currencies.find((c) =>
      c.countryCodes
        .split(",")
        .map((x) => x.trim().toUpperCase())
        .includes(cc)
    );
    if (match) return strip(match);
  }

  const fallback = currencies.find((c) => c.code === FALLBACK_CODE) ?? currencies[0];
  return strip(fallback);
}

function strip(c: CatalogCurrency): ActiveCurrency {
  return { id: c.id, code: c.code, name: c.name, symbol: c.symbol };
}

/**
 * Active currency for the current request. Reads the `tbs_country` cookie
 * (dynamic) OUTSIDE any cached scope, then resolves against the cached
 * currency list. This keeps the catalog cacheable while pricing stays correct.
 */
export async function getActiveCurrency(): Promise<ActiveCurrency | null> {
  const country = (await cookies()).get(COUNTRY_COOKIE)?.value;
  const currencies = await getEnabledCurrencies();
  return resolveCurrency(currencies, country);
}

/** Format an amount in a given currency using its ISO code. */
export function formatPrice(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
}
