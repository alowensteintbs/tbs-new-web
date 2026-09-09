import "@/components/home/home.css";
import type { Metadata } from "next";
import { PackPremiumPage } from "./_components/pack-premium-page";

export const metadata: Metadata = {
  title: "Pack de inversión premium",
  description:
    "Cuatro formas de invertir en una formación completa, con acompañamiento, tutorías y certificación universitaria.",
};

export default function PackPremiumRoute() {
  return <PackPremiumPage />;
}
