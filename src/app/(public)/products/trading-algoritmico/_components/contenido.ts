import type { SiteNavigationItem } from "@/components/layout/site-header";

export const navegacionTradingAlgoritmico: SiteNavigationItem[] = [
  { label: "Nuestros cursos", href: "/products" },
  { label: "Clases Gratis", href: "/#clases-gratis" },
  { label: "Guías Gratis", href: "/products" },
  { label: "Plataforma IA", href: "/#metodo" },
  { label: "Blog", href: "/products" },
];

export const cursoTradingAlgoritmico = {
  nombre: "Curso de Trading Algorítmico",
  mensual: "73€",
  completo: "950€",
};

export const incluyeTradingAlgoritmico = [
  "Aula virtual de por vida",
  "Clases grupales en directo",
  "6 meses de tutorías",
  "Fiscalidad con TaxDown",
  "Asistente de IA",
  "Acompañamiento y soporte",
];

export const razonesTradingAlgoritmico = [
  {
    titulo: "Porque no se automatiza algo que no entiendes.",
    texto:
      "Primero construye las bases del trading y después te enseña a convertirlas en reglas que un sistema ejecute.",
    icono: "/products/trading-algoritmico/programa/book-open.svg",
  },
  {
    titulo: "Porque lleva la IA a una aplicación concreta.",
    texto:
      "Generar y revisar código, desarrollar herramientas y transformar trading en una estrategia automatizada.",
    icono: "/products/trading-algoritmico/programa/brain.svg",
  },
  {
    titulo: "Porque reduce la barrera de conceptos técnicos.",
    texto:
      "Trabajas fundamentos de IA generativa, programación y herramientas para no depender de código manual.",
    icono: "/products/trading-algoritmico/programa/code.svg",
  },
  {
    titulo: "Porque crear un algoritmo no es suficiente.",
    texto:
      "Aprendes a probarlo con datos históricos y someterlo a diferentes escenarios.",
    icono: "/products/trading-algoritmico/programa/flask-round.svg",
  },
  {
    titulo: "Porque recorre todo el proceso.",
    texto:
      "Diseño, programación, pruebas, optimización, gestión del riesgo, implementación y seguimiento.",
    icono: "/products/trading-algoritmico/programa/refresh-cw.svg",
  },
  {
    titulo: "Porque la automatización es con tus propias reglas.",
    texto:
      "Entrada, salida y riesgo se establecen antes para reducir decisiones improvisadas.",
    icono: "/products/trading-algoritmico/programa/settings.svg",
  },
] as const;

export const aprendizajesTradingAlgoritmico = [
  {
    titulo: "Construir una base sólida de trading antes de automatizar",
    texto:
      "Entiende el mercado, el comportamiento del precio y el proceso completo que después convertirás en reglas.",
  },
  {
    titulo: "Aplicar la inteligencia artificial a tu operativa",
    texto:
      "Utiliza la IA generativa como apoyo para plantear soluciones, crear herramientas y desarrollar sistemas.",
  },
  {
    titulo: "Convertir una estrategia en reglas precisas",
    texto:
      "Define entradas, salidas, filtros, objetivos y condiciones de riesgo que un algoritmo pueda ejecutar.",
  },
  {
    titulo: "Generar y revisar código con ayuda de IA",
    texto:
      "Aprende a conversar con la IA, interpretar el código y corregirlo sin depender de programación manual.",
  },
  {
    titulo: "Crear indicadores y herramientas para analizar el mercado",
    texto:
      "Diseña recursos que te ayuden a detectar escenarios y tomar decisiones de forma más sistemática.",
  },
  {
    titulo: "Probar estrategias con datos históricos",
    texto:
      "Comprueba el comportamiento de tus reglas en distintos periodos y condiciones antes de utilizarlas.",
  },
  {
    titulo: "Optimizar un algoritmo sin caer en el sobreajuste",
    texto:
      "Evalúa resultados, ajusta parámetros y distingue una mejora real de una solución que sólo funciona en el pasado.",
  },
  {
    titulo: "Implementar y supervisar un sistema automático",
    texto:
      "Pon el algoritmo en funcionamiento, controla el riesgo y realiza un seguimiento continuo de su desempeño.",
  },
] as const;

export const objetivosTradingAlgoritmico = [
  { icono: "chart-no-axes-column-increasing", texto: "La capacidad de entender qué parte de una estrategia de trading se puede automatizar." },
  { icono: "list-checks", texto: "La capacidad de convertir una idea de trading en reglas claras y medibles." },
  { icono: "circle-x", texto: "La capacidad de utilizar IA para generar, revisar y corregir código." },
  { icono: "trending-up", texto: "La capacidad de crear indicadores, herramientas y algoritmos propios." },
  { icono: "folder-open", texto: "La capacidad de probar una estrategia con datos históricos y distintos escenarios." },
  { icono: "calendar", texto: "La capacidad de analizar resultados y optimizar un sistema con criterio." },
  { icono: "shield", texto: "La capacidad de integrar la gestión del riesgo dentro de cada algoritmo." },
  { icono: "globe", texto: "La capacidad de implementar, supervisar y mejorar una operativa automatizada." },
] as const;

export const beneficiosTradingAlgoritmico = [
  {
    titulo: "Feedback para mejorar",
    imagen: "tutorias.png",
    tipo: "tutorias",
    puntos: ["3 meses de tutorías.", "Corrección de prácticas.", "Feedback personalizado."],
  },
  {
    titulo: "Aprende viendo cómo se opera",
    imagen: "/products/trading-algoritmico/beneficios/Coins.png",
    tipo: "operativa",
    puntos: ["Clases grupales en directo.", "Operativa explicada en vivo.", "Preguntas al profesor."],
  },
  {
    titulo: "IA dentro de tu formación",
    imagen: "asistente.png",
    tipo: "asistente",
    puntos: ["Consulta conceptos al instante.", "Sube ejercicios y tareas.", "Resuelve dudas 24/7."],
  },
  {
    titulo: "Aprende sin fecha límite",
    imagen: "aula.png",
    tipo: "aula",
    puntos: ["Aula virtual de por vida.", "Repasa cuando quieras.", "Avanza a tu ritmo."],
  },
  {
    titulo: "Entiende también tus impuestos",
    imagen: "impuestos.png",
    tipo: "impuestos",
    puntos: ["Fiscalidad aplicada a inversiones.", "Contenido especial de TaxDown.", "Impuestos llevados a la práctica."],
  },
  {
    titulo: "Siempre tienes a quién preguntar",
    imagen: "soporte.png",
    tipo: "soporte",
    puntos: ["Soporte por WhatsApp o email.", "Dudas durante la formación.", "Asistente de IA 24/7."],
  },
] as const;

// Beneficios del Máster indicados en la comparación Curso/Máster del diseño.
export const beneficiosMasterTradingAlgoritmico = [
  {
    ...beneficiosTradingAlgoritmico[0],
    titulo: "12 meses de tutorías individuales ilimitadas",
    puntos: ["Tutorías individuales ilimitadas.", "Corrección de prácticas.", "Feedback personalizado."],
  },
  beneficiosTradingAlgoritmico[1],
  beneficiosTradingAlgoritmico[2],
  {
    titulo: "Robot indicadores generados con IA",
    imagen: "/products/pack-premium/beneficios/indicadores.png",
    tipo: "indicadores",
    puntos: ["Robot indicadores generados con IA."],
  },
  {
    titulo: "Acceso a prueba de fondeo de 10.000€",
    imagen: "/products/pack-premium/beneficios/fondeo.png",
    tipo: "fondeo",
    puntos: ["Acceso a prueba de fondeo de 10.000€."],
  },
  ...beneficiosTradingAlgoritmico.slice(3),
];
