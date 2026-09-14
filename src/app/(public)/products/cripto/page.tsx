import "@/components/home/home.css";
import type { Metadata } from "next";
import { CriptoPage } from "./_components/cripto-page";

export const metadata: Metadata = {
  title: "Curso de Cripto",
  description:
    "Aprende blockchain, exchanges, wallets, estrategias, análisis y gestión del riesgo con acompañamiento profesional.",
};

export default function CriptoRoute() {
  return <CriptoPage />;
}
