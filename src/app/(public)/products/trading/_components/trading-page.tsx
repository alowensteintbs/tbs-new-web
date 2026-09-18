import { AppFooterSection } from "@/components/home/app-footer-section";
import { MentorsCarousel } from "@/components/home/mentors-section";
import { SiteHeader } from "@/components/layout/site-header";
import { ColaboracionesSection } from "../../pack-premium/_components/colaboraciones-section";
import { LlamadaSection } from "../../pack-premium/_components/inscripcion-section";
import packStyles from "../../pack-premium/_components/pack-premium.module.css";
import {
  BarraTrading,
  ClaseGratisTrading,
  HeroTrading,
  InscripcionTrading,
  ProgramaTrading,
} from "./trading-sections";
import styles from "./trading.module.css";

export function TradingPage() {
  const fechaInicial = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Madrid",
  });

  return (
    <div className={`${packStyles.pagina} ${styles.pagina}`}>
      <SiteHeader />
      <main>
        <HeroTrading />
        <ProgramaTrading />
        <ColaboracionesSection />
        <MentorsCarousel variant="product" />
        <LlamadaSection
          landingSlug="trading"
          fechaInicial={fechaInicial}
          producto="Curso de Trading"
        />
        <InscripcionTrading />
        <ClaseGratisTrading fechaInicial={fechaInicial} />
      </main>
      <div className="tbs-grid-dark">
        <AppFooterSection showAppPromo={false} />
      </div>
      <BarraTrading />
    </div>
  );
}
