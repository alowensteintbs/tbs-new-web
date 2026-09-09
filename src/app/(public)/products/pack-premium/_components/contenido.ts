import type { SiteNavigationItem } from "@/components/layout/site-header";

export const navegacion: SiteNavigationItem[] = [
  { label: "Nuestros cursos", href: "/products" },
  { label: "Clases Gratis", href: "/#clases-gratis" },
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
  "Leer gráficos e identificar tendencias, patrones, volumen y zonas relevantes para tomar decisiones.",
  "Analizar una inversión desde su precio y desde los factores económicos que pueden afectarla.",
  "Invertir en acciones, construir una cartera, valorarla y repartir el capital.",
  "Invertir a largo plazo con dividendos, ETFs, fondos indexados, carteras automatizadas y renta fija.",
  "Entender blockchain, wallets, stablecoins, tokens, minería y otras aplicaciones de las criptomonedas.",
  "Gestionar el riesgo y decidir cuánto capital destinar a cada operación o inversión.",
  "Aplicar diferentes estrategias según lo que esté ocurriendo en el mercado.",
  "Medir los resultados de una estrategia y corregirla cuando sea necesario.",
  "Crear un plan de trading con reglas, objetivos y límites claros.",
  "Elegir un bróker teniendo en cuenta su regulación, seguridad, comisiones y condiciones.",
  "Planificar y gestionar tu patrimonio combinando inversiones según tus objetivos.",
  "Tener en cuenta la fiscalidad dentro de tu planificación financiera.",
];
export const objetivos = [
  "Decidir dónde y cómo invertir según tus objetivos.",
  "Elegir y aplicar diferentes estrategias según la situación.",
  "Gestionar el riesgo de tus operaciones de forma más estructurada.",
  "Construir y gestionar una cartera diversificada.",
  "Moverte con autonomía entre plataformas, brókers y herramientas de inversión.",
  "Crear tus propios planes para invertir a corto o largo plazo.",
  "Gestionar tu dinero con una visión de conjunto.",
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
      "Pack de indicadores.",
      "Herramientas de análisis.",
      "Recursos para tu operativa.",
    ],
  },
  {
    titulo: "Entiende también tus impuestos",
    imagen: "",
    tipo: "fiscalidad",
    puntos: [
      "Fiscalidad con TaxDown.",
      "Especialistas en inversión.",
      "Planificación financiera.",
    ],
  },
  {
    titulo: "Todo, siempre disponible",
    imagen: "",
    tipo: "aula",
    puntos: [
      "Aula virtual de por vida.",
      "Clases y grabaciones.",
      "Desde cualquier dispositivo.",
    ],
  },
  {
    titulo: "Siempre tienes a quién preguntar",
    imagen: "",
    tipo: "soporte",
    puntos: [
      "Soporte por WhatsApp y email.",
      "Resolución de dudas.",
      "Acompañamiento continuo.",
    ],
  },
];
