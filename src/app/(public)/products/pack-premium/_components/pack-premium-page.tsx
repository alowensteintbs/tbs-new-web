import { AppFooterSection } from "@/components/home/app-footer-section";
import { FreeCoursesSection } from "@/components/home/free-courses-section";
import { MentorsCarousel } from "@/components/home/mentors-section";
import { SiteHeader } from "@/components/layout/site-header";
import { PresentacionSection, BarraInscripcion } from "./presentacion-section";
import { CertificacionSection, FormacionSection } from "./formacion-section";
import { ColaboracionesSection } from "./colaboraciones-section";
import { InscripcionSection, LlamadaSection } from "./inscripcion-section";
import styles from "./pack-premium.module.css";

export function PackPremiumPage() {
  const fechaInicial = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Madrid",
  });

  return (
    <div className={styles.pagina}>
      <SiteHeader />
      <main>
        <PresentacionSection />
        <CertificacionSection />
        <FormacionSection />
        <ColaboracionesSection />
        <MentorsCarousel variant="product" />
        <LlamadaSection landingSlug="pack-premium" fechaInicial={fechaInicial} />
        <InscripcionSection />
        <FreeCoursesSection className="tbs-grid-dark" showIntro={false} />
      </main>
      <div className="tbs-grid-dark">
        <AppFooterSection showAppPromo={false} />
      </div>
      <BarraInscripcion />
    </div>
  );
}
