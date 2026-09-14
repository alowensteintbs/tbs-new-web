import type { SiteNavigationItem } from "@/components/layout/site-header";

export const navegacionTrading: SiteNavigationItem[] = [
  { label: "Nuestros cursos", href: "/products" },
  { label: "Clases Gratis", href: "/#clases-gratis" },
  { label: "Guías Gratis", href: "/products" },
  { label: "Plataforma IA", href: "/#metodo" },
  { label: "Blog", href: "/products" },
];

export const cursoTrading = {
  nombre: "Curso de Trading",
  mensual: "73€",
  completo: "950€",
};

export const incluyeTrading = [
  "Aula virtual de por vida",
  "Clases grupales en directo",
  "3 meses de tutorías",
  "Fiscalidad con TaxDown",
  "Asistente de IA",
  "Acompañamiento y soporte",
];

export const razonesTrading = [
  {
    titulo: "Porque construye las bases antes de pedirte que operes.",
    texto:
      "Qué estás haciendo, qué puedes operar, cómo funciona un bróker y qué debes mirar antes de abrir una posición.",
    icono: "/products/trading/programa/layers-figma.svg",
  },
  {
    titulo: "Porque el precio no siempre se comporta igual.",
    texto:
      "Aprendes a adaptar tu operativa a tendencias, movimientos laterales y momentos de mayor volatilidad.",
    icono: "/products/trading/programa/trending-up-figma.svg",
  },
  {
    titulo: "Porque aprendes a tener en cuenta lo que ocurre antes de operar.",
    texto:
      "Noticias, volatilidad y condiciones del día también forman parte de la decisión.",
    icono: "/products/trading/programa/newspaper-figma.svg",
  },
  {
    titulo: "Porque aprendes un proceso completo.",
    texto:
      "Analizar el precio, preparar la sesión, elegir una estrategia, controlar el riesgo, ejecutar y revisar los resultados.",
    icono: "/products/trading/programa/check-circle-figma.svg",
  },
  {
    titulo: "Porque no se trata de confiar en que la estrategia funciona",
    texto:
      "Aprendes a medir sus resultados y comprobarla antes de plantearte utilizar dinero real.",
    icono: "/products/trading/programa/bar-chart-3-figma.svg",
  },
  {
    titulo: "Porque el objetivo final es construir tu propia forma de operar.",
    texto:
      "Con reglas, objetivos y gestión del riesgo que puedas aplicar por tu cuenta.",
    icono: "/products/trading/programa/user-cog-figma.svg",
  },
] as const;

export const aprendizajesTrading = [
  {
    titulo: "Leer gráficos y movimientos del precio",
    texto:
      "Identifica tendencias, soportes, resistencias, volumen y zonas relevantes del mercado.",
  },
  {
    titulo: "Preparar una operación antes de entrar",
    texto:
      "Define escenarios, niveles clave, objetivos y condiciones de invalidación con antelación.",
  },
  {
    titulo: "Elegir una estrategia según el mercado",
    texto:
      "Adapta tu operativa a tendencias, rangos, roturas y momentos de mayor volatilidad.",
  },
  {
    titulo: "Gestionar el riesgo de forma consistente",
    texto:
      "Decide cuánto capital arriesgar y protege cada operación con reglas claras.",
  },
  {
    titulo: "Operar con indicadores y herramientas",
    texto:
      "Usa recursos técnicos para validar decisiones sin depender de señales externas.",
  },
  {
    titulo: "Medir tus resultados",
    texto:
      "Registra operaciones y analiza ratios para detectar errores y oportunidades de mejora.",
  },
  {
    titulo: "Controlar la parte emocional",
    texto:
      "Construye rutinas que te ayuden a respetar el plan incluso en momentos de presión.",
  },
  {
    titulo: "Crear tu propio plan de trading",
    texto:
      "Reúne estrategia, riesgo, horarios y revisión en un proceso que puedas repetir.",
  },
] as const;

export const objetivosTrading = [
  { icono: "chart-no-axes-column-increasing", texto: "Analizar gráficos con criterio y reconocer contextos de mercado." },
  { icono: "list-checks", texto: "Preparar y ejecutar operaciones con un proceso definido." },
  { icono: "shield", texto: "Gestionar el riesgo antes de buscar rentabilidad." },
  { icono: "trending-up", texto: "Adaptar tu estrategia a distintos movimientos del precio." },
  { icono: "folder-open", texto: "Registrar, revisar y mejorar tu operativa con datos." },
  { icono: "calendar", texto: "Construir una rutina sostenible y un plan propio de trading." },
] as const;

export const beneficiosTrading = [
  {
    titulo: "Feedback para mejorar",
    imagen: "tutorias.png",
    tipo: "tutorias",
    puntos: [
      "3 meses de tutorías.",
      "Corrección de prácticas.",
      "Feedback personalizado.",
    ],
  },
  {
    titulo: "Practica antes de arriesgar",
    imagen: "fondeo.png",
    tipo: "fondeo",
    puntos: [
      "Operativa en simulación.",
      "Aplicación de los sistemas.",
      "Corrección de errores.",
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
    titulo: "Aprende viendo cómo se opera",
    imagen: "operativa.png",
    tipo: "operativa",
    puntos: [
      "Clases grupales en directo.",
      "Operativa explicada en vivo.",
      "Pregunta al profesor.",
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
      "Soporte por WhatsApp o email.",
      "Dudas durante la formación.",
      "Asistente de IA 24/7.",
    ],
  },
] as const;
