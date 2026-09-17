import { AppFooterSection } from "@/components/home/app-footer-section";
import { MentorsCarousel } from "@/components/home/mentors-section";
import { SiteHeader } from "@/components/layout/site-header";
import { ColaboracionesSection } from "../../pack-premium/_components/colaboraciones-section";
import { LlamadaSection } from "../../pack-premium/_components/inscripcion-section";
import packStyles from "../../pack-premium/_components/pack-premium.module.css";
import {
  BarraInversor,
  CertificacionUniversitaria,
  ClaseGratisInversor,
  HeroInversor,
  InscripcionInversor,
  ProgramaInversor,
} from "./inversor-inteligente-sections";
import styles from "./inversor-inteligente.module.css";

export function InversorInteligentePage() {
  const fechaInicial = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Madrid",
  });

  return (
    <div className={`${packStyles.pagina} ${styles.pagina}`}>
      <SiteHeader />
      <main>
        <HeroInversor />
        <CertificacionUniversitaria />
        <ProgramaInversor />
        <ColaboracionesSection />
        <MentorsCarousel variant="product" />
        <LlamadaSection
          fechaInicial={fechaInicial}
          producto="Curso de Inversor Inteligente"
        />
        <InscripcionInversor />
        <ClaseGratisInversor fechaInicial={fechaInicial} />
      </main>
      <div className="tbs-grid-dark">
        <AppFooterSection showAppPromo={false} />
      </div>
      <BarraInversor />
    </div>
  );
}
