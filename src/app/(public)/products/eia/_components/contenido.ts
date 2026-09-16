import type { SiteNavigationItem } from "@/components/layout/site-header";

export const navegacionEia: SiteNavigationItem[] = [
  { label: "Nuestros cursos", href: "/products" },
  { label: "Clases Gratis", href: "/clases-gratis" },
  { label: "Sobre nosotros", href: "/#sobre-nosotros" },
];

export const cursoEia = {
  nombre: "European Investment Assistant",
  mensual: "73€",
  completo: "950€",
};

export const incluyeEia = [
  "Aula virtual de por vida",
  "Bolsa de empleo con Renta4",
  "Práctica con simuladores",
  "Clases grupales en directo",
  "3 meses de tutorías",
  "Asistente de IA",
  "Beneficios con TaxDown",
  "Acompañamiento y soporte",
];

export const razonesEia = [
  {
    titulo: "Porque es tu puerta de entrada al sector financiero.",
    texto: "Adquieres una base profesional para informar sobre productos y servicios de inversión.",
    icono: "/products/acciones/programa/briefcase.svg",
  },
  {
    titulo: "Porque entiendes cómo funcionan los mercados.",
    texto: "Aprendes los conceptos esenciales de renta fija, renta variable y fondos de inversión.",
    icono: "/products/acciones/programa/chart-no-axes-column.svg",
  },
  {
    titulo: "Porque aprendes a explicar productos con claridad.",
    texto: "Conviertes la información financiera en respuestas comprensibles y útiles para cada cliente.",
    icono: "/products/inversor-inteligente/programa/user.svg",
  },
  {
    titulo: "Porque trabajas dentro del marco normativo.",
    texto: "Conoces las obligaciones de información y protección al inversor que establece MiFID II.",
    icono: "/products/pack-premium/programa/shield.svg",
  },
  {
    titulo: "Porque te prepara para la certificación EFPA.",
    texto: "Practicas con ejercicios, simuladores y casos orientados al examen oficial EIA.",
    icono: "/products/pack-premium/programa/list-checks.svg",
  },
  {
    titulo: "Porque puedes seguir creciendo profesionalmente.",
    texto: "EIA acredita funciones de información y te permite avanzar después hacia EIP y EFA.",
    icono: "/products/acciones/programa/building.svg",
  },
] as const;

export const aprendizajesEia = [
  {
    titulo: "Comprender el sistema financiero y sus participantes",
    texto: "Identificando mercados, intermediarios, instituciones y su función dentro de la inversión.",
  },
  {
    titulo: "Conocer los principales productos de inversión",
    texto: "Entendiendo las características básicas de la renta fija, la renta variable y los fondos.",
  },
  {
    titulo: "Relacionar rentabilidad, riesgo y liquidez",
    texto: "Explicando las variables que una persona debe valorar antes de tomar una decisión.",
  },
  {
    titulo: "Informar al cliente con rigor y claridad",
    texto: "Comunicando características, costes y riesgos sin convertir la información en asesoramiento.",
  },
  {
    titulo: "Aplicar las normas de protección al inversor",
    texto: "Trabajando dentro de MiFID II y de las obligaciones propias de las funciones de información.",
  },
  {
    titulo: "Prepararte para el examen EIA",
    texto: "Resolviendo ejercicios y simulaciones alineadas con la certificación de EFPA España.",
  },
] as const;

export const objetivosEia = [
  {
    icono: "/products/inversor-inteligente/programa/eye.svg",
    texto: "La capacidad de reconocer los productos y servicios financieros más habituales.",
  },
  {
    icono: "/products/pack-premium/programa/list-checks.svg",
    texto: "La capacidad de explicar sus características, costes y riesgos de forma clara.",
  },
  {
    icono: "/products/inversor-inteligente/programa/bar-chart.svg",
    texto: "Una base sólida para desenvolverte en entidades y servicios de inversión.",
  },
  {
    icono: "/products/pack-premium/programa/shield.svg",
    texto: "La preparación necesaria para acreditar funciones de información bajo MiFID II.",
  },
] as const;

export const beneficiosEia = [
  {
    titulo: "Recibe feedback personalizado",
    imagen: "/products/pack-premium/beneficios/tutorias.png",
    tipo: "feedback",
    puntos: ["3 meses de tutorías.", "Resolución de dudas.", "Seguimiento de tu preparación."],
  },
  {
    titulo: "Aprende a informar con criterio",
    imagen: "/products/efa/beneficios/asesor.png",
    tipo: "informacion",
    puntos: ["Productos y servicios financieros.", "Riesgos, costes y condiciones.", "Información clara para el cliente."],
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
    titulo: "Domina las bases del sector",
    imagen: "/products/efa/beneficios/carteras.png",
    tipo: "sector",
    puntos: ["Renta fija y variable.", "Fondos de inversión.", "Riesgo, rentabilidad y liquidez."],
  },
  {
    titulo: "Trabaja dentro de la normativa",
    imagen: "/products/efa/beneficios/progreso.png",
    tipo: "normativa",
    puntos: ["MiFID II.", "Protección del cliente.", "Ética y cumplimiento financiero."],
  },
  {
    titulo: "Conecta tu formación con el sector",
    imagen: "/products/efa/beneficios/sector.png",
    tipo: "empleo",
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
