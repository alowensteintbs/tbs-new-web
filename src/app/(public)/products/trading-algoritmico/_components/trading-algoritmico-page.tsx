import { AppFooterSection } from "@/components/home/app-footer-section";
import { MentorsCarousel } from "@/components/home/mentors-section";
import { SiteHeader } from "@/components/layout/site-header";
import { ColaboracionesSection } from "../../pack-premium/_components/colaboraciones-section";
import { LlamadaSection } from "../../pack-premium/_components/inscripcion-section";
import packStyles from "../../pack-premium/_components/pack-premium.module.css";
import { ClaseGratisTrading } from "../../trading/_components/trading-sections";
import {
  BarraTradingAlgoritmico,
  HeroTradingAlgoritmico,
  InscripcionTradingAlgoritmico,
  ProgramaTradingAlgoritmico,
} from "./trading-algoritmico-sections";
import styles from "./trading-algoritmico.module.css";

export function TradingAlgoritmicoPage() {
  const fechaInicial = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Madrid",
  });

  return (
    <div className={`${packStyles.pagina} ${styles.pagina}`}>
      <SiteHeader />
      <main>
        <HeroTradingAlgoritmico />
        <ProgramaTradingAlgoritmico />
        <ColaboracionesSection />
        <MentorsCarousel variant="product" />
        <LlamadaSection
          fechaInicial={fechaInicial}
          producto="Curso de Trading Algorítmico"
        />
        <InscripcionTradingAlgoritmico />
        <ClaseGratisTrading fechaInicial={fechaInicial} variante="algoritmico" />
      </main>
      <div className="tbs-grid-dark">
        <AppFooterSection showAppPromo={false} />
      </div>
      <BarraTradingAlgoritmico />
    </div>
  );
}
