import type { SiteNavigationItem } from "@/components/layout/site-header";

export const navegacionEfa: SiteNavigationItem[] = [
  { label: "Nuestros cursos", href: "/products" },
  { label: "Clases Gratis", href: "/clases-gratis" },
  { label: "Sobre nosotros", href: "/#sobre-nosotros" },
];

export const cursoEfa = {
  nombre: "European Financial Advisor",
  mensual: "73€",
  completo: "950€",
};

export const incluyeEfa = [
  "Aula virtual de por vida",
  "Bolsa de empleo con Renta4",
  "Práctica con simuladores",
  "Clases grupales en directo",
  "3 meses de tutorías",
  "Asistente de IA",
  "Beneficios con TaxDown",
  "Acompañamiento 24/7 de soporte",
];

export const razonesEfa = [
  {
    titulo: "Porque el asesoramiento pasa a ser una gestión completa",
    texto: "Aprendes a analizar la situación financiera y patrimonial del cliente como un conjunto.",
    icono: "/products/acciones/programa/briefcase.svg",
  },
  {
    titulo: "Porque profundiza en gestión y construcción de carteras.",
    texto: "Modelos como Markowitz y CAPM, asignación de activos y ratios que permiten analizar riesgo y rendimiento.",
    icono: "/products/acciones/programa/chart-no-axes-column.svg",
  },
  {
    titulo: "Porque amplía las alternativas dentro del asesoramiento.",
    texto: "Aprendes fondos indexados o dividendos y estrategias de trading adaptadas a los movimientos del precio.",
    icono: "/products/acciones/programa/target.svg",
  },
  {
    titulo: "Porque está orientada a una preparación más amplia",
    texto: "Desarrollar tu carrera en asesoramiento financiero, banca personal, banca privada y gestión patrimonial.",
    icono: "/products/acciones/programa/building.svg",
  },
  {
    titulo: "Porque busca entender al cliente y el marco profesional",
    texto: "No dependes de una única forma de invertir y entiendes las posibilidades antes de decidir.",
    icono: "/products/inversor-inteligente/programa/user.svg",
  },
  {
    titulo: "Porque incorpora decisiones que afectan al patrimonio.",
    texto: "Fiscalidad, previsión social, seguros, crédito y solvencia entran dentro del análisis.",
    icono: "/products/pack-premium/programa/shield.svg",
  },
] as const;

export const aprendizajesEfa = [
  {
    titulo: "Analizar el entorno financiero y económico",
    texto: "Interpretando las variables que influyen en las decisiones financieras y patrimoniales.",
  },
  {
    titulo: "Medir rentabilidad y riesgo con criterios profesionales",
    texto: "Utilizando métricas, modelos y ratios para evaluar distintas alternativas de inversión.",
  },
  {
    titulo: "Analizar y seleccionar productos de inversión",
    texto: "Comparando sus características, costes, riesgos y adecuación a cada perfil.",
  },
  {
    titulo: "Construir y gestionar carteras, aplicando diversificación",
    texto: "Asignando activos y revisando la cartera en función de objetivos y condiciones de mercado.",
  },
  {
    titulo: "Integrar criterios ESG en las decisiones de inversión",
    texto: "Incorporando factores ambientales, sociales y de gobierno corporativo al análisis.",
  },
  {
    titulo: "Incorporar seguros, inmobiliario y financiación en la planificación",
    texto: "Tratando el patrimonio del cliente desde una perspectiva global.",
  },
  {
    titulo: "Aplicar la fiscalidad a la planificación patrimonial",
    texto: "Entendiendo el impacto fiscal de las decisiones y productos financieros.",
  },
  {
    titulo: "Aplicar MiFIDII y los principios éticos del asesoramiento",
    texto: "Trabajando dentro del marco normativo y profesional de la actividad.",
  },
] as const;

export const objetivosEfa = [
  {
    icono: "/products/pack-premium/programa/globe.svg",
    texto: "La capacidad de analizar de forma global una situación financiera y patrimonial.",
  },
  {
    icono: "/products/inversor-inteligente/programa/target.svg",
    texto: "La capacidad de construir recomendaciones según objetivos.",
  },
  {
    icono: "/products/pack-premium/programa/list-checks.svg",
    texto: "La capacidad de diseñar, analizar y gestionar carteras de inversión.",
  },
  {
    icono: "/products/inversor-inteligente/programa/bar-chart.svg",
    texto: "La capacidad de evaluar rendimiento y riesgo con herramientas profesionales.",
  },
] as const;

export const beneficiosEfa = [
  {
    titulo: "Recibe feedback personalizado",
    imagen: "/products/pack-premium/beneficios/tutorias.png",
    tipo: "feedback",
    puntos: ["3 meses de tutorías.", "Resolución de dudas.", "Seguimiento de tu preparación."],
  },
  {
    titulo: "Asesora con una visión global",
    imagen: "/products/efa/beneficios/asesor.png",
    tipo: "asesor",
    puntos: ["Inversión y patrimonio.", "Fiscalidad y previsión.", "Financiación y seguros."],
  },
  {
    titulo: "Prepárate para el examen EFPA",
    imagen: "/products/efa/beneficios/examen.png",
    tipo: "examen",
    puntos: ["Casos reales y simuladores.", "Ejercicios aplicados.", "Preparación orientada al examen."],
  },
  {
    titulo: "Tu asistente, disponible 24/7",
    imagen: "/products/pack-premium/beneficios/asistente.png",
    tipo: "asistente",
    puntos: ["Pregunta cuando quieras.", "Sube ejercicios y tareas.", "Apoyo dentro del aula."],
  },
  {
    titulo: "Construye carteras con criterio",
    imagen: "/products/efa/beneficios/carteras.png",
    tipo: "carteras",
    puntos: ["Asignación de activos.", "Riesgo y rentabilidad.", "Modelos y ratios profesionales."],
  },
  {
    titulo: "Lleva tu asesoramiento más lejos",
    imagen: "/products/efa/beneficios/progreso.png",
    tipo: "progreso",
    puntos: ["Necesidades patrimoniales.", "Planificación financiera.", "Recomendaciones personalizadas."],
  },
  {
    titulo: "Conecta tu formación con el sector",
    imagen: "/products/efa/beneficios/sector.png",
    tipo: "sector",
    puntos: ["Bolsa de empleo con Renta 4.", "Acceso a prácticas.", "Oportunidades profesionales."],
  },
  {
    titulo: "Todo, siempre disponible",
    imagen: "/products/pack-premium/beneficios/aula.png",
    tipo: "aula",
    puntos: ["Aula virtual de por vida.", "Accede cuando quieras.", "Repasa cualquier formación."],
  },
  {
    titulo: "Siempre tienes a quién preguntar",
    imagen: "/products/pack-premium/beneficios/soporte.png",
    tipo: "soporte",
    puntos: ["Soporte por WhatsApp y email.", "Dudas durante la formación.", "Asistente de IA 24/7."],
  },
] as const;
