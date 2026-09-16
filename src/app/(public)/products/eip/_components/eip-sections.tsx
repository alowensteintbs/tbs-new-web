import { PartnersStrip, VideoShowcase } from "@/components/home/video-showcase";
import { AcreditacionEfpa } from "../../pack-premium/_components/acreditacion-efpa";
import { BeneficiosSection } from "../../pack-premium/_components/beneficios-section";
import { BotonPack, Etiqueta, FormatoCurso } from "../../pack-premium/_components/elementos";
import { MasInformacion } from "../../pack-premium/_components/mas-informacion";
import packStyles from "../../pack-premium/_components/pack-premium.module.css";
import { ProgramaTabs } from "../../pack-premium/_components/programa-tabs";
import { ResultadosProfesionales } from "../../pack-premium/_components/resultados-profesionales";
import tradingStyles from "../../trading/_components/trading.module.css";
import {
  aprendizajesEip,
  beneficiosEip,
  cursoEip,
  incluyeEip,
  objetivosEip,
  razonesEip,
} from "./contenido";
import styles from "./eip.module.css";

export function TituloEip({ principal = false }: { principal?: boolean }) {
  const Tag = principal ? "h1" : "h2";

  return (
    <Tag className={`${tradingStyles.tituloTrading} ${principal ? tradingStyles.tituloPrincipal : ""} ${styles.tituloEip}`}>
      European
      <br />
      Investment
      <br />
      <em>Practitioner</em>
    </Tag>
  );
}

export function HeroEip() {
  return (
    <section className={`tbs-grid-dark ${tradingStyles.presentacion}`}>
      <div className={tradingStyles.contenedor}>
        <div className={tradingStyles.hero}>
          <div>
            <div className={styles.etiquetasHero}>
              <Etiqueta tono="lima">Plazas abiertas</Etiqueta>
              <Etiqueta tono="lima">Convocatoria examen · 30 septiembre 2026</Etiqueta>
            </div>
            <TituloEip principal />
            <FormatoCurso />
          </div>
          <aside className={`${packStyles.resumen} ${styles.resumenEip}`} aria-label="Qué incluye European Investment Practitioner">
            <div className={packStyles.resumenContenido}>
              <ul>
                {incluyeEip.map((item) => <li key={item}><span aria-hidden="true">➜</span>{item}</li>)}
              </ul>
              <div className={packStyles.precioResumen}>
                <div><strong>{cursoEip.mensual}</strong><span>/mes</span></div>
                <p>{cursoEip.completo} completo</p>
              </div>
            </div>
            <div className={packStyles.accionesResumen}>
              <BotonPack href="#inscripcion">Inscribirme ahora</BotonPack>
              <BotonPack href="#informacion" tono="cristal">Solicitar información</BotonPack>
            </div>
          </aside>
        </div>
        <div className={tradingStyles.alianzas}><PartnersStrip /></div>
      </div>
      <VideoShowcase showPartners={false} poster="/products/pack-premium/presentacion.png" className={`${packStyles.video} ${tradingStyles.videoTrading}`} />
      <div className={tradingStyles.descargarPrograma}>
        <BotonPack href="#programa" tono="rosa">Descargar programa <span aria-hidden="true">↓</span></BotonPack>
      </div>
    </section>
  );
}

export function ProgramaEip() {
  return (
    <section className={`tbs-grid-light ${tradingStyles.programaSeccion} ${styles.programaEip}`}>
      <div className={tradingStyles.contenedor}>
        <ProgramaTabs etiquetaProducto="European Investment Practitioner · EIP" razonesPrograma={razonesEip} aprendizajesPrograma={aprendizajesEip} objetivosPrograma={objetivosEip} />
        <ResultadosProfesionales />
        <BeneficiosSection producto="European Investment Practitioner" beneficiosLista={beneficiosEip} assetsSlug="eip" />
      </div>
    </section>
  );
}

export function InscripcionEip() {
  return (
    <section className={`tbs-grid-blue ${tradingStyles.inscripcion}`} id="inscripcion">
      <div className={tradingStyles.contenedor}>
        <div className={tradingStyles.inscripcionCabecera}>
          <div><Etiqueta tono="blanco">Empieza cuando quieras</Etiqueta><TituloEip /></div>
          <div className={tradingStyles.precios}>
            <article><div><span>12 meses</span><span>Aplazame</span></div><strong>{cursoEip.mensual}</strong><BotonPack href="#informacion" tono="verde">Inscribirme hoy</BotonPack></article>
            <article><div><span>Pago único</span><span>Garantía 15 días</span></div><strong>{cursoEip.completo}</strong><BotonPack href="#informacion" tono="verde">Inscribirme hoy</BotonPack></article>
          </div>
        </div>
        <MasInformacion />
      </div>
    </section>
  );
}

export function BarraEip() {
  return (
    <aside className={packStyles.barraInscripcion} aria-label="Inscripción a European Investment Practitioner">
      <div className={packStyles.contenedor}>
        <div className={packStyles.barraProducto}>
          <div className={packStyles.barraPrecio}><strong>{cursoEip.mensual}</strong><span>/ mes</span></div>
          <p>European Investment <em>Practitioner</em></p>
        </div>
        <div className={packStyles.barraAcciones}>
          <BotonPack href="#inscripcion" tono="blanco">Inscríbete hoy</BotonPack>
          <BotonPack href="#informacion" tono="cristal">Solicita información</BotonPack>
        </div>
      </div>
    </aside>
  );
}

export { AcreditacionEfpa as AcreditacionEip };
