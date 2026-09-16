import "@/components/home/home.css";
import type { Metadata } from "next";
import { EipPage } from "./_components/eip-page";

export const metadata: Metadata = {
  title: "European Investment Practitioner (EIP)",
  description:
    "Prepárate para la certificación European Investment Practitioner y aprende a construir propuestas de inversión adaptadas a cada perfil.",
};

export default function EipRoute() {
  return <EipPage />;
}
