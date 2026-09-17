export const categorias = [
  { id: "economia", nombre: "Economía" },
  { id: "trading", nombre: "Trading" },
  { id: "acciones", nombre: "Acciones" },
  { id: "criptomonedas", nombre: "Criptomonedas" },
  { id: "inteligencia-artificial", nombre: "Inteligencia Artificial" },
] as const;

export type ArticuloBlog = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: (typeof categorias)[number]["id"];
  imagen?: string;
  href?: string;
};

// Contenido de muestra del Figma. Sustituir por artículos publicados al conectar el CMS.
export const articulos: ArticuloBlog[] = Array.from({ length: 8 }, (_, indice) => ({
  id: `articulo-${indice + 1}`,
  titulo: "Guía de Productividad",
  descripcion: "Aprende a gestionar tu tiempo, evitar distracciones y optimizar tus hábitos diarios de inversión.",
  categoria: "economia",
}));
