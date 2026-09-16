import Image from "next/image";
import { PartnersStrip, VideoShowcase } from "@/components/home/video-showcase";
import { AcreditacionSection } from "../../pack-premium/_components/acreditacion-section";
import { BeneficiosSection } from "../../pack-premium/_components/beneficios-section";
import { BotonPack, Etiqueta, FormatoCurso } from "../../pack-premium/_components/elementos";
import { FormularioContacto } from "../../pack-premium/_components/formulario-contacto";
import { MasInformacion } from "../../pack-premium/_components/mas-informacion";
import packStyles from "../../pack-premium/_components/pack-premium.module.css";
import { ProgramaTabs } from "../../pack-premium/_components/programa-tabs";
import tradingStyles from "../../trading/_components/trading.module.css";
import { ClaseGratisDetalles } from "../../trading/_components/clase-gratis-detalles";
import {
  aprendizajesInversor,
  beneficiosInversor,
  cursoInversor,
  incluyeInversor,
  objetivosInversor,
  razonesInversor,
} from "./contenido";
import styles from "./inversor-inteligente.module.css";

export function TituloInversor({ principal = false }: { principal?: boolean }) {
  const Tag = principal ? "h1" : "h2";
  return (
    <Tag className={`${tradingStyles.tituloTrading} ${principal ? tradingStyles.tituloPrincipal : ""} ${styles.tituloInversor}`}>
      Curso de
      <br />
      <em>Inversor<br />inteligente</em>
    </Tag>
  );
}

export function HeroInversor() {
  return (
    <section className={`tbs-grid-dark ${tradingStyles.presentacion}`}>
      <div className={tradingStyles.contenedor}>
        <div className={tradingStyles.hero}>
          <div>
            <Etiqueta tono="lima">Plazas abiertas</Etiqueta>
            <TituloInversor principal />
            <FormatoCurso />
          </div>
          <aside className={packStyles.resumen} aria-label="Qué incluye el Curso de Inversor Inteligente">
            <div className={packStyles.resumenContenido}>
              <ul>
                {incluyeInversor.map((item) => <li key={item}><span aria-hidden="true">➜</span>{item}</li>)}
              </ul>
              <div className={packStyles.precioResumen}>
                <div><strong>{cursoInversor.mensual}</strong><span>/mes</span></div>
                <p>{cursoInversor.completo} completo</p>
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

export function CertificacionUniversitaria() {
  return (
    <AcreditacionSection
      idTitulo="titulo-certificacion"
      titulo={<>Tendrás certificación <em>universitaria</em></>}
      subtitulo={<>Somos la única escuela de trading e inversión en España con<br className={styles.soloDesktop} /> titulación universitaria con créditos ECTS.</>}
      variante="universitaria"
      lateral={
        <div className={styles.marcaUniversidad}>
          <Image src="/home/ecosystem/utamed.svg" alt="UTAMED Universidad" width={173} height={40} />
          <strong>Universidad online<br />del grupo Unicaja</strong>
        </div>
      }
    >
      <div className={styles.certificacionOpciones}>
        <ul className={styles.ventajasCertificacion}>
          <li>Sin coste adicional de expedición</li>
          <li>Créditos ECTS europeos</li>
          <li>Respaldado por Unicaja</li>
          <li>Válido para CV y LinkedIn</li>
        </ul>
        <article>
          <header><strong>Máster de formación permanente</strong><span>Máster</span></header>
          <h3>Nombre de titulación</h3>
          <p>Para titulados universitarios</p>
          <b>60 créditos ECTS</b>
        </article>
        <article>
          <header><strong>Curso de estudios avanzados</strong><span>Curso</span></header>
          <h3>Nombre de titulación</h3>
          <p>Para no titulados universitarios</p>
          <b>60 créditos ECTS</b>
        </article>
      </div>
    </AcreditacionSection>
  );
}

export function ProgramaInversor() {
  return (
    <section className={`tbs-grid-light ${tradingStyles.programaSeccion} ${styles.programaInversor}`}>
      <div className={tradingStyles.contenedor}>
        <ProgramaTabs etiquetaProducto="Inversor inteligente" razonesPrograma={razonesInversor} aprendizajesPrograma={aprendizajesInversor} objetivosPrograma={objetivosInversor} />
        <BeneficiosSection producto="Curso de Inversor Inteligente" beneficiosLista={beneficiosInversor} assetsSlug="inversor-inteligente" />
      </div>
    </section>
  );
}

export function InscripcionInversor() {
  return (
    <section className={`tbs-grid-blue ${tradingStyles.inscripcion}`} id="inscripcion">
      <div className={tradingStyles.contenedor}>
        <div className={tradingStyles.inscripcionCabecera}>
          <div><Etiqueta tono="blanco">Empieza cuando quieras</Etiqueta><TituloInversor /></div>
          <div className={tradingStyles.precios}>
            <article><div><span>12 meses</span><span>Aplazame</span></div><strong>{cursoInversor.mensual}</strong><BotonPack href="#informacion" tono="verde">Inscribirme hoy</BotonPack></article>
            <article><div><span>Pago único</span><span>Garantía 15 días</span></div><strong>{cursoInversor.completo}</strong><BotonPack href="#informacion" tono="verde">Inscribirme hoy</BotonPack></article>
          </div>
        </div>
        <MasInformacion />
      </div>
    </section>
  );
}

export function ClaseGratisInversor({ fechaInicial }: { fechaInicial: string }) {
  return (
    <section className={`tbs-grid-dark ${tradingStyles.claseGratis}`} id="clase-gratis">
      <div className={tradingStyles.contenedor}>
        <h2>¿Quieres ver una<br />clase <em>totalmente gratis?</em></h2>
        <div className={tradingStyles.claseGratisGrid}>
          <div className={tradingStyles.claseImagen}>
            <Image src="/products/trading/clase-gratis.png" alt="Clase gratuita Aprende a invertir desde cero" fill sizes="(min-width: 900px) 50vw, calc(100vw - 48px)" />
          </div>
          <article className={`${tradingStyles.claseFormulario} ${styles.claseFormularioInversor}`}>
            <Etiqueta tono="lima">Plazas disponibles</Etiqueta>
            <h3>Aprende a invertir<br />desde cero</h3>
            <p>Aprende una forma estructurada de analizar oportunidades, gestionar el riesgo y empezar a invertir, incluso con poco.</p>
            <ClaseGratisDetalles />
            <FormularioContacto claseGratis fechaInicial={fechaInicial} producto="Clase gratuita Aprende a invertir desde cero" />
          </article>
        </div>
      </div>
    </section>
  );
}

export function BarraInversor() {
  return (
    <aside className={packStyles.barraInscripcion} aria-label="Inscripción al Curso de Inversor Inteligente">
      <div className={packStyles.contenedor}>
        <div className={packStyles.barraProducto}>
          <div className={packStyles.barraPrecio}><strong>{cursoInversor.mensual}</strong><span>/ mes</span></div>
          <p>Curso de <em>Inversor inteligente</em></p>
        </div>
        <div className={packStyles.barraAcciones}>
          <BotonPack href="#inscripcion" tono="blanco">Inscríbete hoy</BotonPack>
          <BotonPack href="#informacion" tono="cristal">Solicita información</BotonPack>
        </div>
      </div>
    </aside>
  );
}
