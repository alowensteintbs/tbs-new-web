import Image from "next/image";
import { PartnersStrip, VideoShowcase } from "@/components/home/video-showcase";
import { BeneficiosSection } from "../../pack-premium/_components/beneficios-section";
import { BotonPack, Etiqueta, FormatoCurso } from "../../pack-premium/_components/elementos";
import { FormularioContacto } from "../../pack-premium/_components/formulario-contacto";
import { MasInformacion } from "../../pack-premium/_components/mas-informacion";
import packStyles from "../../pack-premium/_components/pack-premium.module.css";
import { ProgramaTabs } from "../../pack-premium/_components/programa-tabs";
import tradingStyles from "../../trading/_components/trading.module.css";
import { ClaseGratisDetalles } from "../../trading/_components/clase-gratis-detalles";
import {
  aprendizajesFinanzas,
  beneficiosFinanzas,
  cursoFinanzas,
  incluyeFinanzas,
  objetivosFinanzas,
  razonesFinanzas,
} from "./contenido";
import styles from "./finanzas-personales.module.css";

export function TituloFinanzas({ principal = false }: { principal?: boolean }) {
  const Tag = principal ? "h1" : "h2";
  return (
    <Tag className={`${tradingStyles.tituloTrading} ${principal ? tradingStyles.tituloPrincipal : ""} ${styles.tituloFinanzas}`}>
      Curso de
      <br />
      <em>Finanzas<br />personales</em>
    </Tag>
  );
}

export function HeroFinanzas() {
  return (
    <section className={`tbs-grid-dark ${tradingStyles.presentacion}`}>
      <div className={tradingStyles.contenedor}>
        <div className={tradingStyles.hero}>
          <div>
            <Etiqueta tono="lima">Plazas abiertas</Etiqueta>
            <TituloFinanzas principal />
            <FormatoCurso />
          </div>
          <aside className={packStyles.resumen} aria-label="Qué incluye el Curso de Finanzas Personales">
            <div className={packStyles.resumenContenido}>
              <ul>
                {incluyeFinanzas.map((item) => <li key={item}><span aria-hidden="true">➜</span>{item}</li>)}
              </ul>
              <div className={packStyles.precioResumen}>
                <div><strong>{cursoFinanzas.mensual}</strong><span>/mes</span></div>
                <p>{cursoFinanzas.completo} completo</p>
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

export function ProgramaFinanzas() {
  return (
    <section className={`tbs-grid-light ${tradingStyles.programaSeccion} ${styles.programaFinanzas}`}>
      <div className={tradingStyles.contenedor}>
        <ProgramaTabs etiquetaProducto="Finanzas personales" razonesPrograma={razonesFinanzas} aprendizajesPrograma={aprendizajesFinanzas} objetivosPrograma={objetivosFinanzas} />
        <BeneficiosSection producto="Curso de Finanzas Personales" beneficiosLista={beneficiosFinanzas} assetsSlug="finanzas-personales" />
      </div>
    </section>
  );
}

export function InscripcionFinanzas() {
  return (
    <section className={`tbs-grid-blue ${tradingStyles.inscripcion}`} id="inscripcion">
      <div className={tradingStyles.contenedor}>
        <div className={tradingStyles.inscripcionCabecera}>
          <div><Etiqueta tono="blanco">Empieza cuando quieras</Etiqueta><TituloFinanzas /></div>
          <div className={tradingStyles.precios}>
            <article><div><span>12 meses</span><span>Aplazame</span></div><strong>{cursoFinanzas.mensual}</strong><BotonPack href="#informacion" tono="verde">Inscribirme hoy</BotonPack></article>
            <article><div><span>Pago único</span><span>Garantía 15 días</span></div><strong>{cursoFinanzas.completo}</strong><BotonPack href="#informacion" tono="verde">Inscribirme hoy</BotonPack></article>
          </div>
        </div>
        <MasInformacion />
      </div>
    </section>
  );
}

export function ClaseGratisFinanzas({ fechaInicial }: { fechaInicial: string }) {
  return (
    <section className={`tbs-grid-dark ${tradingStyles.claseGratis}`} id="clase-gratis">
      <div className={tradingStyles.contenedor}>
        <h2>¿Quieres ver una<br />clase <em>totalmente gratis?</em></h2>
        <div className={tradingStyles.claseGratisGrid}>
          <div className={tradingStyles.claseImagen}>
            <Image src="/products/trading/clase-gratis.png" alt="Clase gratuita de Finanzas desde cero" fill sizes="(min-width: 900px) 50vw, calc(100vw - 48px)" />
          </div>
          <article className={`${tradingStyles.claseFormulario} ${styles.claseFormularioFinanzas}`}>
            <Etiqueta tono="lima">Plazas disponibles</Etiqueta>
            <h3>Aprende finanzas<br />desde cero</h3>
            <p>Aprende una forma estructurada de analizar oportunidades, gestionar el riesgo y empezar a invertir, incluso con poco.</p>
            <ClaseGratisDetalles />
            <FormularioContacto claseGratis fechaInicial={fechaInicial} producto="Clase gratuita de Finanzas desde cero" />
          </article>
        </div>
      </div>
    </section>
  );
}

export function BarraFinanzas() {
  return (
    <aside className={packStyles.barraInscripcion} aria-label="Inscripción al Curso de Finanzas Personales">
      <div className={packStyles.contenedor}>
        <div className={packStyles.barraProducto}>
          <div className={packStyles.barraPrecio}><strong>{cursoFinanzas.mensual}</strong><span>/ mes</span></div>
          <p>Curso de <em>Finanzas personales</em></p>
        </div>
        <div className={packStyles.barraAcciones}>
          <BotonPack href="#inscripcion" tono="blanco">Inscríbete hoy</BotonPack>
          <BotonPack href="#informacion" tono="cristal">Solicita información</BotonPack>
        </div>
      </div>
    </aside>
  );
}
