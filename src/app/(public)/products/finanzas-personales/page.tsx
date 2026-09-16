import "@/components/home/home.css";
import type { Metadata } from "next";
import { FinanzasPersonalesPage } from "./_components/finanzas-personales-page";

export const metadata: Metadata = {
  title: "Curso de Finanzas Personales",
  description:
    "Ordena tus finanzas, crea un presupuesto sostenible y aprende a ahorrar e invertir con un plan adaptado a tu realidad.",
};

export default function FinanzasPersonalesRoute() {
  return <FinanzasPersonalesPage />;
}
