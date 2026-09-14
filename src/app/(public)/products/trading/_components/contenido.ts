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
    titulo: "Entender los mercados de corto plazo y elegir bien dónde operar",
    texto:
      "Comprende cómo funcionan los mercados de corto plazo y qué debes valorar antes de elegir dónde operar.",
  },
  {
    titulo: "Leer gráficos e interpretar el comportamiento del precio",
    texto:
      "Identifica tendencias, soportes, resistencias, volumen y zonas relevantes del mercado.",
  },
  {
    titulo: "Detectar oportunidades de entrada y salida",
    texto:
      "Define escenarios, niveles clave, objetivos y condiciones de invalidación con antelación.",
  },
  {
    titulo: "Preparar cada sesión de trading antes de operar",
    texto:
      "Organiza el contexto, los escenarios y los niveles importantes antes de empezar cada sesión.",
  },
  {
    titulo: "Adaptar la estrategia al tipo de mercado",
    texto:
      "Adapta tu operativa a tendencias, rangos, roturas y momentos de mayor volatilidad.",
  },
  {
    titulo: "Gestionar el riesgo de cada operación",
    texto:
      "Decide cuánto capital arriesgar y protege cada operación con reglas claras.",
  },
  {
    titulo: "Construir un plan de trading y evaluar tu operativa con datos",
    texto:
      "Registra tus operaciones y analiza resultados para detectar errores y oportunidades de mejora.",
  },
  {
    titulo: "Gestionar la parte psicológica y fiscal del trading",
    texto:
      "Construye rutinas para respetar tu plan y comprende cómo afecta la fiscalidad a tu operativa.",
  },
] as const;

export const objetivosTrading = [
  { icono: "chart-no-axes-column-increasing", texto: "La capacidad de leer gráficos e interpretar movimientos del precio." },
  { icono: "circle-x", texto: "La capacidad de detectar posibles zonas de entrada y salida." },
  { icono: "list-checks", texto: "La capacidad de preparar una sesión antes de operar." },
  { icono: "trending-up", texto: "La capacidad de adaptar una estrategia a diferentes escenarios." },
  { icono: "shield", texto: "La capacidad de decidir cuánto arriesgar en cada operación." },
  { icono: "folder-open", texto: "La capacidad de medir con datos si tu forma de operar funciona." },
  { icono: "circle-x", texto: "La capacidad de gestionar las emociones dentro de tu operativa." },
  { icono: "calendar", texto: "La capacidad de construir y seguir tu propio plan de trading." },
  { icono: "globe", texto: "La capacidad de tomar decisiones de trading con criterio propio." },
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
