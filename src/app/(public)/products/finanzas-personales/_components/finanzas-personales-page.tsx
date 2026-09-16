import { AppFooterSection } from "@/components/home/app-footer-section";
import { MentorsCarousel } from "@/components/home/mentors-section";
import { SiteHeader } from "@/components/layout/site-header";
import { ColaboracionesSection } from "../../pack-premium/_components/colaboraciones-section";
import { LlamadaSection } from "../../pack-premium/_components/inscripcion-section";
import packStyles from "../../pack-premium/_components/pack-premium.module.css";
import { navegacionFinanzas } from "./contenido";
import {
  BarraFinanzas,
  ClaseGratisFinanzas,
  HeroFinanzas,
  InscripcionFinanzas,
  ProgramaFinanzas,
} from "./finanzas-personales-sections";
import styles from "./finanzas-personales.module.css";

export function FinanzasPersonalesPage() {
  const fechaInicial = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Madrid",
  });

  return (
    <div className={`${packStyles.pagina} ${styles.pagina}`}>
      <SiteHeader items={navegacionFinanzas} />
      <main>
        <HeroFinanzas />
        <ProgramaFinanzas />
        <ColaboracionesSection />
        <MentorsCarousel variant="product" />
        <LlamadaSection
          fechaInicial={fechaInicial}
          producto="Curso de Finanzas Personales"
        />
        <InscripcionFinanzas />
        <ClaseGratisFinanzas fechaInicial={fechaInicial} />
      </main>
      <div className="tbs-grid-dark">
        <AppFooterSection showAppPromo={false} />
      </div>
      <BarraFinanzas />
    </div>
  );
}
