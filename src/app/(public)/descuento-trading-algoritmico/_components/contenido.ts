// Precios y textos de la maqueta de Figma (Web - 2026, nodo 8253:28228).
import type { LandingDescuento } from "@/components/descuento/descuento-landing";
import { productPurchasePath } from "@/lib/product-landings";

export const descuentoTradingAlgoritmico: LandingDescuento = {
  titulo: ["Trading + IA", "con criterio y", "descuento"],
  finOferta: null,
  etiquetaComparativa: "Curso vs Master",
  tituloComparativa: "¿Curso o Master? Tú eliges.",
  incluye: [
    "Aula virtual de por vida",
    "Acompañamiento y soporte",
    "Fiscalidad con TaxDown",
    "Asistente de IA",
  ],
  curso: {
    titulo: ["Curso", "Trading + IA"],
    nombre: "Curso de Trading + IA",
    descripcion: "Aprendes a incorporar la IA en tus operaciones de trading.",
    tutorias: "6 meses",
    mensual: "73€",
    completo: "950€",
    href: productPurchasePath("trading-algoritmico"),
  },
  premium: {
    titulo: ["Master", "Trading + IA"],
    enfasis: 0,
    nombre: "Master de Trading + IA",
    descripcion:
      "Todo lo del curso, con más tiempo, herramientas y práctica para llevar tu operativa más lejos.",
    tutorias: "12 meses",
    mensual: "73€",
    completo: "950€",
    // El Máster no tiene landing ni producto vinculado todavía: lleva a reservar llamada.
    href: "#llamada",
    bonus: [
      { texto: "Robot indicadores generados con IA" },
      { texto: "Acceso a prueba de fondeo de", destacado: "10.000€" },
    ],
  },
  llamada: {
    landingSlug: "trading-algoritmico",
    producto: "Curso de Trading Algorítmico",
  },
};
