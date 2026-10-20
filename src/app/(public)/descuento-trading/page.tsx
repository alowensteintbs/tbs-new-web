import "@/components/home/home.css";
import type { Metadata } from "next";
import { DescuentoLanding } from "@/components/descuento/descuento-landing";
import { descuentoTrading } from "./_components/contenido";

export const metadata: Metadata = {
  title: "Trading con criterio y descuento",
  description:
    "Oferta por tiempo limitado: elige entre el Curso de Trading y el Pack premium con aula virtual de por vida, tutorías y acompañamiento.",
};

export default function DescuentoTradingRoute() {
  return <DescuentoLanding landing={descuentoTrading} />;
}
