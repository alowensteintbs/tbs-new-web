import type { SiteNavigationItem } from "@/components/layout/site-header";

export const navegacionEip: SiteNavigationItem[] = [
  { label: "Nuestros cursos", href: "/products" },
  { label: "Clases Gratis", href: "/clases-gratis" },
  { label: "Sobre nosotros", href: "/#sobre-nosotros" },
];

export const cursoEip = {
  nombre: "European Investment Practitioner",
  mensual: "73€",
  completo: "950€",
};

export const incluyeEip = [
  "Aula virtual de por vida",
  "Bolsa de empleo con Renta4",
  "Práctica con simuladores",
  "Clases grupales en directo",
  "3 meses de tutorías",
  "Asistente de IA",
  "Beneficios con TaxDown",
  "Acompañamiento 24/7 de soporte",
];

export const razonesEip = [
  {
    titulo: "Porque pasas de conocer los productos a aprender cómo utilizarlos.",
    texto: "Aprendes a construir recomendaciones según las necesidades de la persona.",
    icono: "/products/acciones/programa/briefcase.svg",
  },
  {
    titulo: "Porque no se busca “el mejor producto” de forma aislada.",
    texto: "Combinas diferentes inversiones y repartes el capital para construir una propuesta coherente al perfil.",
    icono: "/products/acciones/programa/chart-no-axes-column.svg",
  },
  {
    titulo: "Porque incorpora la fiscalidad y la regulación.",
    texto: "Aprendes qué debes tener en cuenta al plantear una propuesta y qué exige MiFID II para proteger al inversor.",
    icono: "/products/pack-premium/programa/shield.svg",
  },
  {
    titulo: "Porque pone al cliente en el centro antes de plantear una inversión.",
    texto: "Aprendes a valorar su situación, objetivos y el riesgo que puede asumir.",
    icono: "/products/inversor-inteligente/programa/user.svg",
  },
  {
    titulo: "Porque conecta inversión y planificación personal.",
    texto: "Fondos, renta fija, renta variable y seguros se estudian como piezas que responden a necesidades diferentes.",
    icono: "/products/inversor-inteligente/programa/target.svg",
  },
  {
    titulo: "Porque te prepara para dar un paso profesional importante.",
    texto: "EIP está orientada al asesoramiento financiero a particulares y sirve además como progresión hacia EFA.",
    icono: "/products/acciones/programa/building.svg",
  },
] as const;

export const aprendizajesEip = [
  {
    titulo: "Analizar las necesidades y el perfil de cada cliente",
    texto: "Valorando su situación financiera, sus objetivos, horizonte temporal y tolerancia al riesgo.",
  },
  {
    titulo: "Conocer los principales productos y mercados financieros",
    texto: "Comprendiendo cómo funcionan la renta fija, la renta variable, los fondos y los seguros.",
  },
  {
    titulo: "Construir propuestas de inversión coherentes",
    texto: "Combinando productos de acuerdo con el perfil y las necesidades de cada persona.",
  },
  {
    titulo: "Aplicar criterios básicos de diversificación",
    texto: "Repartiendo el capital para equilibrar riesgo, rentabilidad y horizonte temporal.",
  },
  {
    titulo: "Incorporar la fiscalidad en las recomendaciones",
    texto: "Entendiendo el impacto fiscal de las decisiones y de los productos financieros.",
  },
  {
    titulo: "Trabajar dentro del marco MiFID II",
    texto: "Aplicando las obligaciones de información, protección y adecuación al inversor.",
  },
] as const;

export const objetivosEip = [
  {
    icono: "/products/inversor-inteligente/programa/target.svg",
    texto: "La capacidad de identificar objetivos, necesidades y perfil de riesgo.",
  },
  {
    icono: "/products/pack-premium/programa/list-checks.svg",
    texto: "La capacidad de seleccionar y combinar productos de inversión.",
  },
  {
    icono: "/products/inversor-inteligente/programa/bar-chart.svg",
    texto: "La capacidad de plantear propuestas coherentes y diversificadas.",
  },
  {
    icono: "/products/pack-premium/programa/shield.svg",
    texto: "La base profesional para asesorar bajo MiFID II y progresar hacia EFA.",
  },
] as const;

export const beneficiosEip = [
  {
    titulo: "Recibe feedback personalizado",
    imagen: "/products/pack-premium/beneficios/tutorias.png",
    tipo: "feedback",
    puntos: ["3 meses de tutorías.", "Resolución de dudas.", "Seguimiento de tu preparación."],
  },
  {
    titulo: "Aprende a asesorar",
    imagen: "/products/efa/beneficios/asesor.png",
    tipo: "asesor",
    puntos: ["Analiza cada perfil.", "Define objetivos y horizonte.", "Plantea inversiones adecuadas."],
  },
  {
    titulo: "Tu asistente, disponible 24/7",
    imagen: "/products/pack-premium/beneficios/asistente.png",
    tipo: "asistente",
    puntos: ["Pregunta cuando quieras.", "Sube ejercicios y tareas.", "Apoyo dentro del aula."],
  },
  {
    titulo: "Prepárate para el examen EFPA",
    imagen: "/products/efa/beneficios/examen.png",
    tipo: "examen",
    puntos: ["Casos reales y simuladores.", "Ejercicios aplicados.", "Preparación orientada al examen."],
  },
  {
    titulo: "Construye propuestas con criterio",
    imagen: "/products/efa/beneficios/carteras.png",
    tipo: "carteras",
    puntos: ["Perfil y objetivos.", "Riesgo y rentabilidad.", "Productos adecuados."],
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
