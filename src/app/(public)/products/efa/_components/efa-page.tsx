import { AppFooterSection } from "@/components/home/app-footer-section";
import { MentorsCarousel } from "@/components/home/mentors-section";
import { SiteHeader } from "@/components/layout/site-header";
import { ColaboracionesSection } from "../../pack-premium/_components/colaboraciones-section";
import { LlamadaSection } from "../../pack-premium/_components/inscripcion-section";
import packStyles from "../../pack-premium/_components/pack-premium.module.css";
import { navegacionEfa } from "./contenido";
import {
  AcreditacionEfa,
  BarraEfa,
  HeroEfa,
  InscripcionEfa,
  ProgramaEfa,
} from "./efa-sections";
import styles from "./efa.module.css";

export function EfaPage() {
  const fechaInicial = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Madrid",
  });

  return (
    <div className={`${packStyles.pagina} ${styles.pagina}`}>
      <SiteHeader items={navegacionEfa} />
      <main>
        <HeroEfa />
        <AcreditacionEfa />
        <ProgramaEfa />
        <ColaboracionesSection variante="efa" />
        <MentorsCarousel variant="product" />
        <LlamadaSection
          fechaInicial={fechaInicial}
          producto="European Financial Advisor (EFA)"
        />
        <InscripcionEfa />
      </main>
      <div className="tbs-grid-dark">
        <AppFooterSection showAppPromo={false} />
      </div>
      <BarraEfa />
    </div>
  );
}
