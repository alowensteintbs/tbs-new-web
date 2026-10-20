import "@/components/home/home.css";
import type { Metadata } from "next";
import { DescuentoLanding } from "@/components/descuento/descuento-landing";
import { descuentoCripto } from "./_components/contenido";

export const metadata: Metadata = {
  title: "Criptos con criterio y descuento",
  description:
    "Oferta por tiempo limitado: elige entre el Curso de Criptomonedas y el Pack premium con aula virtual de por vida, tutorías y acompañamiento.",
};

export default function DescuentoCriptoRoute() {
  return <DescuentoLanding landing={descuentoCripto} />;
}
