import type { Metadata } from "next";
import { IndiceClasesGratis } from "./_components/indice-clases";

export const metadata: Metadata = {
  title: "Clases gratuitas de inversión",
  description:
    "Elige entre nuestras clases gratuitas de trading, acciones, criptomonedas y trading algorítmico.",
};

export default function ClasesGratisPage() {
  return <IndiceClasesGratis />;
}

