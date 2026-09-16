import "@/components/home/home.css";
import type { Metadata } from "next";
import { EfaPage } from "./_components/efa-page";

export const metadata: Metadata = {
  title: "European Financial Advisor (EFA)",
  description:
    "Prepárate para la certificación European Financial Advisor y desarrolla tu carrera en asesoramiento financiero y gestión patrimonial.",
};

export default function EfaRoute() {
  return <EfaPage />;
}
