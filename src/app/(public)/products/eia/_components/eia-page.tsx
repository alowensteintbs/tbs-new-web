import { AppFooterSection } from "@/components/home/app-footer-section";
import { MentorsCarousel } from "@/components/home/mentors-section";
import { SiteHeader } from "@/components/layout/site-header";
import { ColaboracionesSection } from "../../pack-premium/_components/colaboraciones-section";
import { LlamadaSection } from "../../pack-premium/_components/inscripcion-section";
import packStyles from "../../pack-premium/_components/pack-premium.module.css";
import {
  AcreditacionEia,
  BarraEia,
  HeroEia,
  InscripcionEia,
  ProgramaEia,
} from "./eia-sections";
import styles from "./eia.module.css";

export function EiaPage() {
  const fechaInicial = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Madrid",
  });

  return (
    <div className={`${packStyles.pagina} ${styles.pagina}`}>
      <SiteHeader />
      <main>
        <HeroEia />
        <AcreditacionEia />
        <ProgramaEia />
        <ColaboracionesSection variante="efa" />
        <MentorsCarousel variant="product" />
        <LlamadaSection
          landingSlug="eia"
          fechaInicial={fechaInicial}
          producto="European Investment Assistant (EIA)"
        />
        <InscripcionEia />
      </main>
      <div className="tbs-grid-dark">
        <AppFooterSection showAppPromo={false} />
      </div>
      <BarraEia />
    </div>
  );
}
