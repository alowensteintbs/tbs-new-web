import type { SiteNavigationItem } from "@/components/layout/site-header";

export const navegacion: SiteNavigationItem[] = [
  { label: "Nuestros cursos", href: "/products" },
  { label: "Clases Gratis", href: "/clases-gratis" },
  { label: "Guías Gratis", href: "/products" },
  { label: "Plataforma IA", href: "/#metodo" },
  { label: "Blog", href: "/products" },
];

// Precios de la maqueta de Figma. La inscripción conduce a la solicitud de información.
export const pack = {
  mensual: "73€",
  completo: "950€",
  contacto: "info@tradersbusinessschool.com",
};
export const incluye = [
  "Aula virtual de por vida",
  "Certificación universitaria UTAMED",
  "Clases grupales en directo",
  "12 meses de tutorías",
  "Fiscalidad con TaxDown",
  "Asistente de IA",
  "Acceso a pruebas de fondeo",
  "Indicadores de operativa",
  "Acompañamiento y soporte",
];

export const cursos = [
  {
    titulo: "Trading",
    imagen: "trading-symbol.png",
    descripcion:
      "Suma una operativa más activa para aprender a aprovechar movimientos a corto plazo.",
  },
  {
    titulo: "Acciones",
    imagen: "stocks-symbol.png",
    descripcion:
      "Suma una estrategia y una forma de invertir con foco en el crecimiento a largo plazo.",
  },
  {
    titulo: "Criptomonedas",
    imagen: "crypto-symbol.png",
    descripcion:
      "Suma los activos digitales a tu estrategia entendiendo sus oportunidades y sus riesgos.",
  },
  {
    titulo: "Trading algorítmico",
    imagen: "ai-symbol.png",
    descripcion:
      "Suma IA y automatización para crear sistemas que ejecuten estrategias por ti.",
  },
];

export const razones = [
  {
    titulo: "Porque no te obliga a elegir una única forma de invertir.",
    texto:
      "Trading, acciones, cripto, inversión pasiva, renta fija, dividendos y ETFs forman parte de una misma formación.",
    icono: "icon-tutoring.svg",
  },
  {
    titulo: "Porque conoces a fondo los diferentes activos.",
    texto:
      "Aprendes a analizarlos, entender sus riesgos y decidir qué lugar pueden ocupar dentro de una estrategia.",
    icono: "icon-preview.svg",
  },
  {
    titulo: "Porque combina inversión a largo plazo y operativa activa.",
    texto:
      "Aprendes fondos indexados o dividendos y estrategias de trading adaptadas a los movimientos del precio.",
    icono: "icon-operativa.svg",
  },
  {
    titulo: "Porque trabaja el proceso completo.",
    texto:
      "Analizar, preparar una operación, elegir una estrategia, gestionar el riesgo, medir resultados y corregir.",
    icono: "icon-practice.svg",
  },
  {
    titulo: "Porque abarca desde una operación hasta tu patrimonio.",
    texto:
      "Aprendes a construir carteras, elegir intermediarios, controlar costes y tener en cuenta la fiscalidad.",
    icono: "icon-preview.svg",
  },
  {
    titulo: "Porque conocer alternativas te permite elegir mejor.",
    texto:
      "No dependes de una única forma de invertir y entiendes las posibilidades antes de decidir.",
    icono: "icon-live.svg",
  },
];

export const aprendizajes = [
  {
    titulo: "Analizar gráficos y entender los movimientos del precio",
    texto: "Identificando tendencias, patrones, volumen, soportes, resistencias y zonas relevantes.",
  },
  {
    titulo: "Diseñar y ejecutar tus operaciones con criterio",
    texto: "Preparando entradas, escenarios, niveles clave y condiciones antes de operar.",
  },
  {
    titulo: "Adaptar tu estrategia a los entornos de mercado",
    texto: "Sabiendo cómo actuar en tendencia, lateralidad, roturas de rango y fases de mayor volatilidad.",
  },
  {
    titulo: "Gestionar el riesgo y crear un plan sólido",
    texto: "Definiendo cuánto capital destinar a cada operación, objetivos, límites y reglas de actuación.",
  },
  {
    titulo: "Evaluar y mejorar tu operativa con datos concretos",
    texto: "Analizando resultados, comportamientos y ratios de las estrategias para detectar errores y optimizar decisiones.",
  },
  {
    titulo: "Construir y gestionar una cartera diversificada",
    texto: "Combinando análisis fundamental, análisis técnico, asignación de capital y planificación según tus objetivos.",
  },
  {
    titulo: "Invertir a medio y largo plazo en distintos activos",
    texto: "Comprendiendo acciones, dividendos, ETFs, fondos indexados, renta fija y soluciones de inversión automatizada.",
  },
  {
    titulo: "Planificar tu patrimonio con fiscalidad y activos digitales",
    texto: "Entendiendo cómo afectan los impuestos a tus inversiones y cómo desenvolverte en el ecosistema cripto: blockchain, wallets, stablecoins y tokens.",
  },
];
export const objetivos = [
  { icono: "chart-no-axes-column-increasing", texto: "La capacidad de analizar inversiones desde diferentes perspectivas." },
  { icono: "circle-x", texto: "La capacidad de elegir entre distintas formas de invertir según tus objetivos." },
  { icono: "list-checks", texto: "La capacidad de preparar y ejecutar operaciones con un proceso definido." },
  { icono: "trending-up", texto: "La capacidad de adaptar tus estrategias a diferentes movimientos del precio." },
  { icono: "shield", texto: "La capacidad de gestionar el riesgo y medir tus resultados." },
  { icono: "folder-open", texto: "La capacidad de construir y gestionar una cartera diversificada." },
  { icono: "calendar", texto: "La capacidad de combinar inversión a corto y largo plazo dentro de una estrategia." },
  { icono: "globe", texto: "La capacidad de gestionar tus inversiones con una visión global del patrimonio." },
];

export const beneficios = [
  {
    titulo: "12 meses para perfeccionarte",
    imagen: "tutorias.png",
    tipo: "tutorias",
    puntos: [
      "Tutorías ilimitadas.",
      "Feedback personalizado.",
      "Corrección de prácticas.",
    ],
  },
  {
    titulo: "Aprende viendo cómo se opera",
    imagen: "operativa.png",
    tipo: "operativa",
    puntos: [
      "Clases grupales en directo.",
      "Operativa explicada en vivo.",
      "Preguntas al profesor.",
    ],
  },
  {
    titulo: "Tu asistente, disponible 24/7",
    imagen: "asistente.png",
    tipo: "asistente",
    puntos: [
      "Pregunta cuando quieras.",
      "Sube ejercicios y tareas.",
      "Apoyo dentro del aula.",
    ],
  },
  {
    titulo: "Pon a prueba tu operativa",
    imagen: "fondeo.png",
    tipo: "fondeo",
    puntos: [
      "Acceso a pruebas de fondeo.",
      "Opera bajo evaluación.",
      "Mide tu preparación.",
    ],
  },
  {
    titulo: "Más herramientas para operar",
    imagen: "operativa.png",
    tipo: "indicadores",
    puntos: [
      "Pack de indicadores incluido.",
      "Recursos para analizar.",
      "Apoyo para tu operativa.",
    ],
  },
  {
    titulo: "Entiende también tus impuestos",
    imagen: "",
    tipo: "impuestos",
    puntos: [
      "Fiscalidad aplicada a inversiones.",
      "Contenido especial de TaxDown.",
      "Impuestos llevados a la práctica.",
    ],
  },
  {
    titulo: "Todo, siempre disponible",
    imagen: "",
    tipo: "aula",
    puntos: [
      "Aula virtual de por vida.",
      "Accede cuando quieras.",
      "Repasa cualquier formación.",
    ],
  },
  {
    titulo: "Siempre tienes a quién preguntar",
    imagen: "",
    tipo: "soporte",
    puntos: [
      "Soporte por WhatsApp y email.",
      "Dudas durante la formación.",
      "Asistente de IA 24/7.",
    ],
  },
];
