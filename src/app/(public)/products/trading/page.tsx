import "@/components/home/home.css";
import type { Metadata } from "next";
import { TradingPage } from "./_components/trading-page";

export const metadata: Metadata = {
  title: "Curso de Trading",
  description:
    "Aprende trading con un método práctico, tutorías, operativa en directo y acompañamiento de profesionales en activo.",
};

export default function TradingRoute() {
  return <TradingPage />;
}
