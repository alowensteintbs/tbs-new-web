import "@/components/home/home.css";
import type { Metadata } from "next";
import { EiaPage } from "./_components/eia-page";

export const metadata: Metadata = {
  title: "European Investment Assistant (EIA)",
  description:
    "Prepárate para la certificación European Investment Assistant y aprende las bases para informar sobre productos y servicios financieros.",
};

export default function EiaRoute() {
  return <EiaPage />;
}
