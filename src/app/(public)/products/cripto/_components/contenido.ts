import type { SiteNavigationItem } from "@/components/layout/site-header";

export const navegacionCripto: SiteNavigationItem[] = [
  { label: "Nuestros cursos", href: "/products" },
  { label: "Clases Gratis", href: "/#clases-gratis" },
  { label: "Guías Gratis", href: "/products" },
  { label: "Plataforma IA", href: "/#metodo" },
  { label: "Blog", href: "/products" },
];

export const cursoCripto = {
  nombre: "Curso de Cripto",
  mensual: "73€",
  completo: "950€",
};

export const incluyeCripto = [
  "Aula virtual de por vida",
  "Clases grupales en directo",
  "3 meses de tutorías",
  "Fiscalidad con TaxDown",
  "Asistente de IA",
  "Acompañamiento y soporte",
];

export const razonesCripto = [
  {
    titulo: "Porque no empieza diciéndote qué criptomoneda comprar.",
    texto: "Te enseñamos qué hay detrás: blockchain, exchanges, wallets, regulación y funcionamiento del ecosistema.",
    icono: "/products/cripto/programa/smart-toy.svg",
  },
  {
    titulo: "Porque aprendes a moverte por cripto de forma práctica.",
    texto: "Comprar, guardar, enviar y recibir activos entendiendo las herramientas que utilizas.",
    icono: "/products/cripto/programa/model-training.svg",
  },
  {
    titulo: "Porque conoces las diferentes formas de invertir en cripto.",
    texto: "Compra directa, inversión de largo plazo y operativas más complejas como futuros o CFDs.",
    icono: "/products/cripto/programa/hub.svg",
  },
  {
    titulo: "Porque aborda cripto como algo más amplio que comprar y vender.",
    texto: "Holdeo, staking, stablecoins, tokens, NFTs, minería e ICOs forman parte del ecosistema.",
    icono: "/products/cripto/programa/memory.svg",
  },
  {
    titulo: "Porque incorpora el análisis a un entorno cambiante.",
    texto: "Aprendes a interpretar el precio y adaptar tus decisiones cuando sube, baja o se mueve lateralmente.",
    icono: "/products/cripto/programa/analytics.svg",
  },
  {
    titulo: "Porque el riesgo forma parte del aprendizaje.",
    texto: "Apalancamiento, gestión del capital, emociones y validación de estrategias se trabajan antes de practicar.",
    icono: "/products/cripto/programa/psychology.svg",
  },
] as const;

export const aprendizajesCripto = [
  {
    titulo: "Entender blockchain y qué hay detrás de una criptomoneda",
    texto: "Comprende blockchain, tokens, minería, NFTs e ICOs y su papel dentro del ecosistema cripto.",
  },
  {
    titulo: "Comprar, vender, enviar y guardar criptomonedas",
    texto: "Utiliza exchanges y wallets de forma práctica para operar y almacenar tus activos.",
  },
  {
    titulo: "Conocer las formas de invertir y operar en cripto",
    texto: "Aprende compra directa, futuros, holdeo, staking, farming, pagos y stablecoins.",
  },
  {
    titulo: "Leer gráficos y analizar los movimientos del precio",
    texto: "Detecta tendencias, patrones, volumen y posibles puntos de entrada y salida.",
  },
  {
    titulo: "Utilizar indicadores para apoyar tus decisiones",
    texto: "Incorpora herramientas de análisis para tomar decisiones con más información.",
  },
  {
    titulo: "Aplicar estrategias según el comportamiento del precio",
    texto: "Adapta tu operativa a distintos escenarios y condiciones del mercado.",
  },
  {
    titulo: "Gestionar el riesgo y crear tu propio plan",
    texto: "Decide cuánto arriesgar, define reglas y adapta el plan a tus objetivos y disponibilidad.",
  },
  {
    titulo: "Evaluar resultados y entender la fiscalidad cripto",
    texto: "Comprueba si una estrategia funciona y conoce cómo tributan las criptomonedas.",
  },
] as const;

export const objetivosCripto = [
  { icono: "globe", texto: "La capacidad de comprar, vender, almacenar y transferir criptomonedas utilizando exchanges y wallets." },
  { icono: "zoom-in-outline-figma", texto: "La capacidad de analizar una criptomoneda más allá de si su precio sube o baja." },
  { icono: "chart-no-axes-column-increasing", texto: "La capacidad de interpretar gráficos y utilizar herramientas para tomar decisiones." },
  { icono: "list-checks", texto: "La capacidad de construir un plan para operar acorde con tus objetivos y tu disponibilidad." },
  { icono: "shield", texto: "La capacidad de aplicar estrategias y gestionar el riesgo antes de poner capital." },
  { icono: "combine-columns-outline-figma", texto: "La capacidad de entender y utilizar holdeo, staking o stablecoins." },
] as const;

export const beneficiosCripto = [
  {
    titulo: "Feedback para mejorar",
    imagen: "tutorias.png",
    tipo: "tutorias",
    puntos: ["3 meses de tutorías.", "Corrección de prácticas.", "Feedback personalizado."],
  },
  {
    titulo: "Aprende viendo cómo se opera",
    imagen: "operativa.png",
    tipo: "operativa",
    puntos: ["Clases grupales en directo.", "Operativa explicada en vivo.", "Preguntas al profesor."],
  },
  {
    titulo: "Tu asistente, disponible 24/7",
    imagen: "asistente.png",
    tipo: "asistente",
    puntos: ["Pregunta cuando quieras.", "Sube ejercicios y tareas.", "Apoyo dentro del aula."],
  },
  {
    titulo: "Practica antes de arriesgar",
    imagen: "simulacion.png",
    tipo: "simulacion",
    puntos: ["Operativa en simulación.", "Aplicación de los sistemas.", "Corrección de errores."],
  },
  {
    titulo: "Entiende también tus impuestos",
    imagen: "impuestos.png",
    tipo: "impuestos",
    puntos: ["Fiscalidad aplicada a inversiones.", "Contenido especial de TaxDown.", "Impuestos llevados a la práctica."],
  },
  {
    titulo: "Todo, siempre disponible",
    imagen: "aula.png",
    tipo: "aula",
    puntos: ["Aula virtual de por vida.", "Accede cuando quieras.", "Repasa cualquier formación."],
  },
  {
    titulo: "Siempre tienes a quién preguntar",
    imagen: "soporte.png",
    tipo: "soporte",
    puntos: ["Soporte por WhatsApp y email.", "Dudas durante la formación.", "Asistente de IA 24/7."],
  },
] as const;
