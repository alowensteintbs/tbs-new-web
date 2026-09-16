import { AppFooterSection } from "@/components/home/app-footer-section";
import { MentorsCarousel } from "@/components/home/mentors-section";
import { SiteHeader } from "@/components/layout/site-header";
import { ColaboracionesSection } from "../../pack-premium/_components/colaboraciones-section";
import { LlamadaSection } from "../../pack-premium/_components/inscripcion-section";
import packStyles from "../../pack-premium/_components/pack-premium.module.css";
import { navegacionAcciones } from "./contenido";
import {
  BarraAcciones,
  ClaseGratisAcciones,
  HeroAcciones,
  InscripcionAcciones,
  ProgramaAcciones,
} from "./acciones-sections";
import styles from "./acciones.module.css";

export function AccionesPage() {
  const fechaInicial = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Madrid",
  });

  return (
    <div className={`${packStyles.pagina} ${styles.pagina}`}>
      <SiteHeader items={navegacionAcciones} />
      <main>
        <HeroAcciones />
        <ProgramaAcciones />
        <ColaboracionesSection />
        <MentorsCarousel variant="product" />
        <LlamadaSection
          fechaInicial={fechaInicial}
          producto="Curso de Acciones"
        />
        <InscripcionAcciones />
        <ClaseGratisAcciones fechaInicial={fechaInicial} />
      </main>
      <div className="tbs-grid-dark">
        <AppFooterSection showAppPromo={false} />
      </div>
      <BarraAcciones />
    </div>
  );
}
