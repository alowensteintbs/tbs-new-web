import "@/components/home/home.css";
import type { Metadata } from "next";
import { TradingAlgoritmicoPage } from "./_components/trading-algoritmico-page";

export const metadata: Metadata = {
  title: "Curso de Trading Algorítmico",
  description:
    "Aprende a combinar trading, inteligencia artificial y automatización para diseñar, probar y supervisar tus propios sistemas.",
};

export default function TradingAlgoritmicoRoute() {
  return <TradingAlgoritmicoPage />;
}
