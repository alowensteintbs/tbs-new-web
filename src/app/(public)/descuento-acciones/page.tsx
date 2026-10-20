import "@/components/home/home.css";
import type { Metadata } from "next";
import { DescuentoLanding } from "@/components/descuento/descuento-landing";
import { descuentoAcciones } from "./_components/contenido";

export const metadata: Metadata = {
  title: "Acciones con criterio y descuento",
  description:
    "Oferta por tiempo limitado: elige entre el Curso de Acciones y el Pack premium con aula virtual de por vida, tutorías y acompañamiento.",
};

export default function DescuentoAccionesRoute() {
  return <DescuentoLanding landing={descuentoAcciones} />;
}
