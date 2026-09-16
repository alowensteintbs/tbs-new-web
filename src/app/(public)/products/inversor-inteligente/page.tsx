import "@/components/home/home.css";
import type { Metadata } from "next";
import { InversorInteligentePage } from "./_components/inversor-inteligente-page";

export const metadata: Metadata = {
  title: "Curso de Inversor Inteligente",
  description:
    "Aprende a analizar alternativas, construir una cartera y crear un plan de inversión adaptado a tus objetivos.",
};

export default function InversorInteligenteRoute() {
  return <InversorInteligentePage />;
}
