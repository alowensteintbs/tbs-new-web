/** Provincias españolas disponibles cuando se selecciona España en el checkout. */
export const SPANISH_PROVINCES = [
  "La Coruña", "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila",
  "Badajoz", "Baleares", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria",
  "Castellón", "Ceuta", "Ciudad Real", "Córdoba", "Cuenca", "Gerona", "Granada",
  "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Jaén", "La Rioja", "Las Palmas",
  "León", "Lérida", "Lugo", "Madrid", "Málaga", "Melilla", "Murcia", "Navarra",
  "Orense", "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia",
  "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid",
  "Vizcaya", "Zamora", "Zaragoza",
] as const;

const COUNTRY_CALLING_CODES: Record<string, string> = {
  AR: "+54", AT: "+43", BE: "+32", BO: "+591", BR: "+55", CL: "+56",
  CO: "+57", CR: "+506", DE: "+49", DO: "+1", EC: "+593", ES: "+34",
  FI: "+358", FR: "+33", GR: "+30", GT: "+502", IE: "+353", IT: "+39",
  LU: "+352", MX: "+52", NL: "+31", PA: "+507", PE: "+51", PT: "+351",
  PY: "+595", US: "+1", UY: "+598",
};

export function isSpanishProvince(value: string) {
  return (SPANISH_PROVINCES as readonly string[]).includes(value);
}

export function isSpanishPostalCode(value: string) {
  return /^\d{5}$/.test(value);
}

export function countryCallingCode(country: string) {
  return COUNTRY_CALLING_CODES[country.toUpperCase()] ?? "";
}
