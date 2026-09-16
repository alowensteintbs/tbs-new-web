import { AppFooterSection } from "@/components/home/app-footer-section";
import { MentorsCarousel } from "@/components/home/mentors-section";
import { SiteHeader } from "@/components/layout/site-header";
import { ColaboracionesSection } from "../../pack-premium/_components/colaboraciones-section";
import { LlamadaSection } from "../../pack-premium/_components/inscripcion-section";
import packStyles from "../../pack-premium/_components/pack-premium.module.css";
import { navegacionEip } from "./contenido";
import {
  AcreditacionEip,
  BarraEip,
  HeroEip,
  InscripcionEip,
  ProgramaEip,
} from "./eip-sections";
import styles from "./eip.module.css";

export function EipPage() {
  const fechaInicial = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Madrid",
  });

  return (
    <div className={`${packStyles.pagina} ${styles.pagina}`}>
      <SiteHeader items={navegacionEip} />
      <main>
        <HeroEip />
        <AcreditacionEip />
        <ProgramaEip />
        <ColaboracionesSection variante="efa" />
        <MentorsCarousel variant="product" />
        <LlamadaSection
          fechaInicial={fechaInicial}
          producto="European Investment Practitioner (EIP)"
        />
        <InscripcionEip />
      </main>
      <div className="tbs-grid-dark">
        <AppFooterSection showAppPromo={false} />
      </div>
      <BarraEip />
    </div>
  );
}
