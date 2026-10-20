// Precios y textos de la maqueta de Figma (Web - 2026, nodo 8191:14641).
import type { LandingDescuento } from "@/components/descuento/descuento-landing";
import { productPurchasePath } from "@/lib/product-landings";

export const descuentoTrading: LandingDescuento = {
  titulo: ["Trading con", "criterio y", "descuento"],
  finOferta: null,
  etiquetaComparativa: "Curso vs Pack premium",
  tituloComparativa: "¿Curso o Pack premium? Tú eliges.",
  incluye: [
    "Aula virtual de por vida",
    "Acompañamiento y soporte",
    "Fiscalidad con TaxDown",
    "Asistente de IA",
  ],
  curso: {
    titulo: ["Curso", "Trading"],
    nombre: "Curso de Trading",
    descripcion:
      "Aprende a hacer trading paso a paso, desde analizar una oportunidad hasta gestionar cada operación.",
    tutorias: "3 meses",
    mensual: "73€",
    completo: "950€",
    href: productPurchasePath("trading"),
  },
  premium: {
    titulo: ["Pack", "premium"],
    enfasis: 1,
    nombre: "Pack premium",
    descripcion:
      "No te quedes con una sola formación: aprende Trading, Acciones, Cripto e IA dentro de un mismo pack.",
    tutorias: "12 meses",
    mensual: "73€",
    completo: "950€",
    href: productPurchasePath("pack-premium"),
    bonus: [
      { texto: "Indicadores de operativa y recursos" },
      { texto: "Acceso a prueba de fondeo de", destacado: "10.000€" },
    ],
  },
  llamada: { landingSlug: "trading", producto: "Curso de Trading" },
};
