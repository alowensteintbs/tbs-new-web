/**
 * Country catalog (ISO 3166-1 alpha-2 → Spanish name) for the markets the shop
 * sells into: the eurozone/EU plus dLocal's Latin-American footprint and the US.
 * Used to build the checkout's billing-country selector — the buyer's country
 * is required by dLocal and by the BNPL providers (SeQura/Aplazame).
 */
export const COUNTRIES: Record<string, string> = {
  // Europa
  ES: "España",
  PT: "Portugal",
  IT: "Italia",
  FR: "Francia",
  DE: "Alemania",
  NL: "Países Bajos",
  BE: "Bélgica",
  IE: "Irlanda",
  AT: "Austria",
  FI: "Finlandia",
  GR: "Grecia",
  LU: "Luxemburgo",
  // Latinoamérica (mercados dLocal)
  MX: "México",
  AR: "Argentina",
  BR: "Brasil",
  CL: "Chile",
  CO: "Colombia",
  PE: "Perú",
  UY: "Uruguay",
  EC: "Ecuador",
  BO: "Bolivia",
  PY: "Paraguay",
  CR: "Costa Rica",
  PA: "Panamá",
  DO: "República Dominicana",
  GT: "Guatemala",
  // Norteamérica
  US: "Estados Unidos",
};

export type CountryOption = { code: string; name: string };

/** Human name for a country code, or the code itself if unknown. */
export function countryName(code: string): string {
  return COUNTRIES[code.toUpperCase()] ?? code.toUpperCase();
}

/**
 * Country options for a selector, sorted by name. When `allowed` is non-empty
 * the list is restricted to those codes (a currency's `countryCodes`); otherwise
 * the full catalog is offered.
 */
export function countryOptions(allowed?: string[]): CountryOption[] {
  const codes =
    allowed && allowed.length > 0
      ? allowed.map((c) => c.toUpperCase()).filter((c) => COUNTRIES[c])
      : Object.keys(COUNTRIES);
  return codes
    .map((code) => ({ code, name: COUNTRIES[code]! }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}
