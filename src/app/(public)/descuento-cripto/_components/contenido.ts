// Precios y textos de la maqueta de Figma (Web - 2026, nodo 8253:29042).
import type { LandingDescuento } from "@/components/descuento/descuento-landing";
import { productPurchasePath } from "@/lib/product-landings";
import { descuentoTrading } from "../../descuento-trading/_components/contenido";

export const descuentoCripto: LandingDescuento = {
  titulo: ["Criptos con", "criterio y", "descuento"],
  finOferta: null,
  etiquetaComparativa: "Curso vs Pack premium",
  tituloComparativa: "¿Curso o Pack premium? Tú eliges.",
  incluye: descuentoTrading.incluye,
  curso: {
    titulo: ["Curso", "Criptomonedas"],
    nombre: "Curso de Criptomonedas",
    descripcion:
      "Aprende a moverte dentro del mundo cripto: analiza oportunidades, compra activos y gestiona el riesgo.",
    tutorias: "3 meses",
    mensual: "73€",
    completo: "950€",
    href: productPurchasePath("cripto"),
  },
  // Misma tarjeta del Pack premium que en la landing de descuento de Trading.
  premium: descuentoTrading.premium,
  llamada: { landingSlug: "cripto", producto: "Curso de Criptomonedas" },
};
