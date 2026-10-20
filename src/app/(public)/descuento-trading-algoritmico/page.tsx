import "@/components/home/home.css";
import type { Metadata } from "next";
import { DescuentoLanding } from "@/components/descuento/descuento-landing";
import { descuentoTradingAlgoritmico } from "./_components/contenido";

export const metadata: Metadata = {
  title: "Trading + IA con criterio y descuento",
  description:
    "Oferta por tiempo limitado: elige entre el Curso y el Master de Trading + IA con aula virtual de por vida, tutorías y acompañamiento.",
};

export default function DescuentoTradingAlgoritmicoRoute() {
  return <DescuentoLanding landing={descuentoTradingAlgoritmico} />;
}
