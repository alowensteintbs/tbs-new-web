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

export function isSpanishProvince(value: string) {
  return (SPANISH_PROVINCES as readonly string[]).includes(value);
}

export function isSpanishPostalCode(value: string) {
  return /^\d{5}$/.test(value);
}
