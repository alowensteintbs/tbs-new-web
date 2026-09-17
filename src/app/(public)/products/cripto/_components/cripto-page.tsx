import { AppFooterSection } from "@/components/home/app-footer-section";
import { MentorsCarousel } from "@/components/home/mentors-section";
import { SiteHeader } from "@/components/layout/site-header";
import { ColaboracionesSection } from "../../pack-premium/_components/colaboraciones-section";
import { LlamadaSection } from "../../pack-premium/_components/inscripcion-section";
import packStyles from "../../pack-premium/_components/pack-premium.module.css";
import {
  BarraCripto,
  ClaseGratisCripto,
  HeroCripto,
  InscripcionCripto,
  ProgramaCripto,
} from "./cripto-sections";
import styles from "./cripto.module.css";

export function CriptoPage() {
  const fechaInicial = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Madrid",
  });

  return (
    <div className={`${packStyles.pagina} ${styles.pagina}`}>
      <SiteHeader />
      <main>
        <HeroCripto />
        <ProgramaCripto />
        <ColaboracionesSection />
        <MentorsCarousel variant="product" />
        <LlamadaSection fechaInicial={fechaInicial} producto="Curso de Cripto" />
        <InscripcionCripto />
        <ClaseGratisCripto fechaInicial={fechaInicial} />
      </main>
      <div className="tbs-grid-dark">
        <AppFooterSection showAppPromo={false} />
      </div>
      <BarraCripto />
    </div>
  );
}
