export const claseGratisSlugs = [
  "trading",
  "acciones",
  "criptomonedas",
  "trading-algoritmico",
] as const;

export const rutasClasesGratis = [
  "/clases-gratis",
  ...claseGratisSlugs.map((slug) => `/clases-gratis/${slug}`),
] as const;

export type ClaseGratisSlug = (typeof claseGratisSlugs)[number];

export type ClaseGratis = {
  slug: ClaseGratisSlug;
  nombre: string;
  nombreCorto: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  simbolo: string;
  lecciones: readonly [string, string, string];
  videoTitulo: string;
  descargableTitulo: string;
  metadata: { title: string; description: string };
};

export const clasesGratis = {
  trading: {
    slug: "trading",
    nombre: "Clase gratuita de Trading",
    nombreCorto: "Trading desde cero",
    titulo: "Aprende cómo invertir y mejorar tus finanzas",
    descripcion: "Descubre cómo funcionan los mercados y aprende un proceso claro para empezar a tomar decisiones con criterio.",
    imagen: "/products/trading/clase-gratis.png",
    simbolo: "/home/courses/trading-symbol.png",
    lecciones: ["Cómo elegir una inversión", "Cómo empezar con poco", "Qué necesitas para hacerlo"],
    videoTitulo: "Vídeo exclusivo: así analizamos una oportunidad",
    descargableTitulo: "Presentación descargable de la clase",
    metadata: { title: "Clase de Trading gratis", description: "Aprende las bases del trading, la lectura de gráficos y la gestión del riesgo en una clase online gratuita." },
  },
  acciones: {
    slug: "acciones",
    nombre: "Clase gratuita de Acciones",
    nombreCorto: "Acciones y Bolsa",
    titulo: "Aprende cómo se puede invertir en acciones",
    descripcion: "Conoce qué mirar en una empresa, cómo comparar oportunidades y cómo empezar a construir una cartera con sentido.",
    imagen: "/products/acciones/beneficios/operativa-v2.png",
    simbolo: "/home/courses/stocks-symbol.png",
    lecciones: ["Cómo elegir una inversión", "Cómo empezar con poco", "Qué necesitas para hacerlo"],
    videoTitulo: "Vídeo exclusivo: análisis de una empresa paso a paso",
    descargableTitulo: "Guía descargable para analizar acciones",
    metadata: { title: "Clase de Bolsa y Acciones gratis", description: "Aprende a analizar empresas, seleccionar acciones y construir una cartera en una clase online gratuita." },
  },
  criptomonedas: {
    slug: "criptomonedas",
    nombre: "Clase gratuita de Criptomonedas",
    nombreCorto: "Cripto desde cero",
    titulo: "Aprende cómo invertir en criptomonedas",
    descripcion: "Entiende qué estás comprando, cómo proteger tus activos y qué criterios usar para separar las oportunidades del ruido.",
    imagen: "/products/cripto/clase-gratis.png",
    simbolo: "/home/courses/crypto-symbol.png",
    lecciones: ["Cómo elegir una inversión", "Cómo empezar con poco", "Qué necesitas para hacerlo"],
    videoTitulo: "Vídeo exclusivo: cómo analizamos un proyecto cripto",
    descargableTitulo: "Checklist descargable para evaluar proyectos",
    metadata: { title: "Clase de Criptomonedas gratis", description: "Aprende las bases de las criptomonedas, los exchanges y la seguridad en una clase online gratuita." },
  },
  "trading-algoritmico": {
    slug: "trading-algoritmico",
    nombre: "Clase gratuita de Trading Algorítmico",
    nombreCorto: "Trading con IA",
    titulo: "Aprende cómo puedes aplicar la IA en trading",
    descripcion: "Descubre cómo transformar una idea en reglas, probar una estrategia y utilizar la automatización para operar con más objetividad.",
    imagen: "/products/trading-algoritmico/clase-gratis.png",
    simbolo: "/home/courses/ai-symbol.png",
    lecciones: ["Cómo elegir una inversión", "Cómo empezar con poco", "Qué necesitas para hacerlo"],
    videoTitulo: "Vídeo exclusivo: una estrategia automatizada por dentro",
    descargableTitulo: "Plantilla descargable para definir estrategias",
    metadata: { title: "Clase de Trading Algorítmico gratis", description: "Descubre cómo aplicar automatización e inteligencia artificial al trading en una clase online gratuita." },
  },
} satisfies Record<ClaseGratisSlug, ClaseGratis>;

export function esClaseGratisSlug(slug: string): slug is ClaseGratisSlug {
  return claseGratisSlugs.includes(slug as ClaseGratisSlug);
}
