import "@/components/home/home.css";
import type { Metadata } from "next";
import { AccionesPage } from "./_components/acciones-page";

export const metadata: Metadata = {
  title: "Curso de Acciones",
  description:
    "Aprende a analizar empresas, valorar acciones y construir una cartera con método, acompañamiento y profesionales en activo.",
};

export default function AccionesRoute() {
  return <AccionesPage />;
}
