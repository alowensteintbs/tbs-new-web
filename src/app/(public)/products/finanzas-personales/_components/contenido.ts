import type { SiteNavigationItem } from "@/components/layout/site-header";

export const navegacionFinanzas: SiteNavigationItem[] = [
  { label: "Nuestros cursos", href: "/products" },
  { label: "Clases Gratis", href: "/clases-gratis" },
  { label: "Guías Gratis", href: "/products" },
  { label: "Plataforma IA", href: "/#metodo" },
  { label: "Blog", href: "/products" },
];

export const cursoFinanzas = {
  nombre: "Curso de Finanzas Personales",
  mensual: "73€",
  completo: "950€",
};

export const incluyeFinanzas = [
  "Aula virtual de por vida",
  "Clases grupales en directo",
  "6 meses de tutorías",
  "Fiscalidad con TaxDown",
  "Asistente de IA",
  "Acompañamiento y soporte",
];

// Texto literal de las tres variantes del componente de Finanzas Personales en Figma.
export const razonesFinanzas = [
  {
    titulo: "Porque antes de pensar en invertir, pone orden en la base.",
    texto: "Ingresos, gastos, ahorro, deudas, hábitos y objetivos forman parte de una misma economía.",
    icono: "/products/finanzas-personales/programa/house.svg",
  },
  {
    titulo: "Porque no se limita a hacer un presupuesto.",
    texto: "Te ayuda a identificar comportamientos, gastos invisibles y decisiones que pueden estar frenando tus finanzas.",
    icono: "/products/finanzas-personales/programa/search-check.svg",
  },
  {
    titulo: "Porque trabaja las deudas con un método.",
    texto: "Aprendes a diferenciarlas, priorizarlas y aplicar estrategias concretas para reducirlas.",
    icono: "/products/finanzas-personales/programa/receipt-text.svg",
  },
  {
    titulo: "Porque utiliza IA y herramientas digitales.",
    texto: "Para hacer más sencillo el seguimiento de tu dinero y convertir información dispersa en decisiones concretas.",
    icono: "/products/finanzas-personales/programa/cpu.svg",
  },
  {
    titulo: "Porque conecta la gestión diaria con el futuro.",
    texto: "Pasas de organizar el mes a pensar también en ahorro, inversión y objetivos a medio y largo plazo.",
    icono: "/products/finanzas-personales/programa/calendar.svg",
  },
  {
    titulo: "Porque está pensado para empezar desde la vida real.",
    texto: "No desde conocimientos financieros previos. Lo que aprendes se aplica directamente a tu propia economía.",
    icono: "/products/finanzas-personales/programa/sparkles.svg",
  },
] as const;

export const aprendizajesFinanzas = [
  {
    titulo: "Analizar tu situación financiera real",
    texto: "Entendiendo tus ingresos, gastos, ahorro, deudas, activos y obligaciones para saber desde qué punto partes.",
  },
  {
    titulo: "Crear un presupuesto sostenible y mejorar hábitos financieros",
    texto: "Detectando gastos innecesarios, automatizando decisiones y aumentando tu capacidad de ahorro.",
  },
  {
    titulo: "Gestionar y reducir tus deudas de forma ordenada",
    texto: "Diferenciando entre deuda útil y perjudicial y aplicando métodos para recuperar equilibrio financiero.",
  },
  {
    titulo: "Dar tus primeros pasos en inversión con criterio",
    texto: "Conociendo las principales alternativas y valorando cada decisión según riesgo, plazo y rentabilidad esperada.",
  },
  {
    titulo: "Utilizar herramientas digitales e IA para gestionar mejor tu dinero",
    texto: "Haciendo seguimiento de gastos, ahorro, objetivos y evolución financiera.",
  },
  {
    titulo: "Definir objetivos económicos y convertirlos en un plan",
    texto: "Organizando tus prioridades a corto, medio y largo plazo según tus necesidades y recursos.",
  },
  {
    titulo: "Elegir entre distintas formas de invertir según tus objetivos",
    texto: "Comprendiendo la diferencia entre inversión activa, inversión pasiva y soluciones automatizadas.",
  },
  {
    titulo: "Entender cómo el entorno económico afecta a tus finanzas",
    texto: "Interpretando el impacto de la inflación, los tipos de interés y otros cambios sobre tu ahorro, deuda e inversiones.",
  },
] as const;

export const objetivosFinanzas = [
  { icono: "/products/finanzas-personales/programa/chart-no-axes-column.svg", texto: "La capacidad de saber exactamente en qué situación están tus finanzas." },
  { icono: "/products/finanzas-personales/programa/eye.svg", texto: "La capacidad de identificar hábitos y gastos que puedes mejorar." },
  { icono: "/products/finanzas-personales/programa/clipboard-check.svg", texto: "La capacidad de construir un presupuesto sostenible." },
  { icono: "/products/finanzas-personales/programa/coins.svg", texto: "La capacidad de aumentar y organizar mejor tu ahorro." },
  { icono: "/products/finanzas-personales/programa/credit-card.svg", texto: "La capacidad de diferenciar y gestionar distintos tipos de deuda." },
  { icono: "/products/finanzas-personales/programa/target.svg", texto: "La capacidad de definir objetivos y convertirlos en una planificación." },
  { icono: "/products/finanzas-personales/programa/cpu.svg", texto: "La capacidad de utilizar IA y herramientas digitales para seguir tus finanzas." },
  { icono: "/products/finanzas-personales/programa/trending-up-down.svg", texto: "La capacidad de valorar una inversión teniendo en cuenta riesgo y rentabilidad." },
] as const;

export const beneficiosFinanzas = [
  {
    titulo: "6 meses para avanzar acompañado",
    imagen: "/products/pack-premium/beneficios/tutorias.png",
    tipo: "tutorias",
    puntos: ["Tutorías ilimitadas durante 6 meses.", "Feedback personalizado.", "Resolución de dudas."],
  },
  {
    titulo: "Aplícalo a tu dinero",
    imagen: "/products/finanzas-personales/beneficios/aplicacion.png",
    tipo: "aplicacion",
    puntos: ["Ejercicios sobre tus finanzas.", "IA aplicada a tu día a día.", "Cambios que puedes hacer."],
  },
  {
    titulo: "Tu asistente, disponible 24/7",
    imagen: "/products/pack-premium/beneficios/asistente.png",
    tipo: "asistente",
    puntos: ["Pregunta cuando quieras.", "Sube ejercicios y tareas.", "Apoyo dentro del aula."],
  },
  {
    titulo: "Entiende también tus impuestos",
    imagen: "/products/pack-premium/beneficios/impuestos.png",
    tipo: "impuestos",
    puntos: ["Fiscalidad aplicada a inversiones.", "Contenido especial de TaxDown.", "Impuestos llevados a la práctica."],
  },
  {
    titulo: "Aprende sin fecha límite",
    imagen: "/products/pack-premium/beneficios/aula.png",
    tipo: "aula",
    puntos: ["Aula virtual de por vida.", "Consulta cuando quieras.", "Revisa tu estrategia."],
  },
  {
    titulo: "Siempre tienes a quién preguntar",
    imagen: "/products/pack-premium/beneficios/soporte.png",
    tipo: "soporte",
    puntos: ["Soporte por WhatsApp y email.", "Dudas durante la formación.", "Asistente de IA 24/7."],
  },
] as const;
