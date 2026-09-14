import { PartnersStrip, VideoShowcase } from "@/components/home/video-showcase";
import { BeneficiosSection } from "../../pack-premium/_components/beneficios-section";
import { BotonPack, Etiqueta, FormatoCurso } from "../../pack-premium/_components/elementos";
import { FormularioContacto } from "../../pack-premium/_components/formulario-contacto";
import { MasInformacion } from "../../pack-premium/_components/mas-informacion";
import packStyles from "../../pack-premium/_components/pack-premium.module.css";
import { ProgramaTabs } from "../../pack-premium/_components/programa-tabs";
import tradingStyles from "../../trading/_components/trading.module.css";
import {
  aprendizajesCripto,
  beneficiosCripto,
  cursoCripto,
  incluyeCripto,
  objetivosCripto,
  razonesCripto,
} from "./contenido";
import styles from "./cripto.module.css";

export function TituloCripto({ principal = false }: { principal?: boolean }) {
  const Tag = principal ? "h1" : "h2";

  return (
    <Tag
      className={`${tradingStyles.tituloTrading} ${principal ? tradingStyles.tituloPrincipal : ""} ${styles.tituloCripto}`}
    >
      Curso
      <br />
      de <em>Cripto</em>
    </Tag>
  );
}

export function HeroCripto() {
  return (
    <section className={`tbs-grid-dark ${tradingStyles.presentacion}`}>
      <div className={tradingStyles.contenedor}>
        <div className={tradingStyles.hero}>
          <div>
            <Etiqueta tono="lima">Plazas abiertas</Etiqueta>
            <TituloCripto principal />
            <FormatoCurso />
          </div>
          <aside className={packStyles.resumen} aria-label="Qué incluye el Curso de Cripto">
            <div className={packStyles.resumenContenido}>
              <ul>
                {incluyeCripto.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true">➜</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className={packStyles.precioResumen}>
                <div>
                  <strong>{cursoCripto.mensual}</strong>
                  <span>/mes</span>
                </div>
                <p>{cursoCripto.completo} completo</p>
              </div>
            </div>
            <div className={packStyles.accionesResumen}>
              <BotonPack href="#inscripcion">Inscribirme ahora</BotonPack>
              <BotonPack href="#informacion" tono="cristal">Solicitar información</BotonPack>
            </div>
          </aside>
        </div>
        <div className={tradingStyles.alianzas}>
          <PartnersStrip />
        </div>
      </div>
      <VideoShowcase
        showPartners={false}
        poster="/products/pack-premium/presentacion.png"
        className={`${packStyles.video} ${tradingStyles.videoTrading}`}
      />
      <div className={tradingStyles.descargarPrograma}>
        <BotonPack href="#programa" tono="rosa">
          Descargar programa <span aria-hidden="true">↓</span>
        </BotonPack>
      </div>
    </section>
  );
}

export function ProgramaCripto() {
  return (
    <section className={`tbs-grid-light ${tradingStyles.programaSeccion}`} id="programa">
      <div className={tradingStyles.contenedor}>
        <ProgramaTabs
          etiquetaProducto="Curso de Cripto"
          razonesPrograma={razonesCripto}
          aprendizajesPrograma={aprendizajesCripto}
          objetivosPrograma={objetivosCripto}
        />
        <BeneficiosSection
          producto="Curso de Cripto"
          beneficiosLista={beneficiosCripto}
          assetsSlug="cripto"
        />
      </div>
    </section>
  );
}

export function InscripcionCripto() {
  return (
    <section className={`tbs-grid-blue ${tradingStyles.inscripcion}`} id="inscripcion">
      <div className={tradingStyles.contenedor}>
        <div className={tradingStyles.inscripcionCabecera}>
          <div>
            <Etiqueta tono="blanco">Empieza cuando quieras</Etiqueta>
            <TituloCripto />
          </div>
          <div className={tradingStyles.precios}>
            <article>
              <span>12 meses · Aplazame</span>
              <strong>{cursoCripto.mensual}</strong>
              <small>Pago mensual</small>
              <BotonPack href="#informacion" tono="verde">Inscribirme hoy</BotonPack>
            </article>
            <article>
              <span>Pago único · Garantía 15 días</span>
              <strong>{cursoCripto.completo}</strong>
              <small>Pago único</small>
              <BotonPack href="#informacion" tono="verde">Inscribirme hoy</BotonPack>
            </article>
          </div>
        </div>
        <MasInformacion />
      </div>
    </section>
  );
}

export function ClaseGratisCripto({ fechaInicial }: { fechaInicial: string }) {
  return (
    <section className={`tbs-grid-dark ${tradingStyles.claseGratis}`} id="clase-gratis">
      <div className={tradingStyles.contenedor}>
        <h2>¿Quieres ver una<br />clase <em>totalmente gratis?</em></h2>
        <div className={tradingStyles.claseGratisGrid}>
          <div className={tradingStyles.claseImagen}>
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/products/trading-algoritmico/clase-gratis.png"
              preload="metadata"
              aria-label="Clase gratuita de Cripto desde cero"
            >
              <source
                src="/products/trading-algoritmico/algoritmico.mp4"
                type="video/mp4"
              />
            </video>
          </div>
          <article className={`${tradingStyles.claseFormulario} ${styles.claseFormularioCripto}`}>
            <Etiqueta tono="lima">Plazas disponibles</Etiqueta>
            <h3>Aprende Cripto<br />desde cero</h3>
            <p>Aprende una forma estructurada de analizar oportunidades, gestionar el riesgo y empezar a invertir, incluso con poco.</p>
            <div className={tradingStyles.formatoClase}>
              <span>50 minutos</span>
              <span>Formato online</span>
            </div>
            <FormularioContacto
              claseGratis
              fechaInicial={fechaInicial}
              producto="Clase gratuita de Cripto desde cero"
            />
          </article>
        </div>
      </div>
    </section>
  );
}

export function BarraCripto() {
  return (
    <aside className={packStyles.barraInscripcion} aria-label="Inscripción al Curso de Cripto">
      <div className={packStyles.contenedor}>
        <div className={packStyles.barraProducto}>
          <div className={packStyles.barraPrecio}>
            <strong>{cursoCripto.mensual}</strong>
            <span>/ mes</span>
          </div>
          <p>Curso de <em>Cripto</em></p>
        </div>
        <div className={packStyles.barraAcciones}>
          <BotonPack href="#inscripcion" tono="blanco">Inscríbete hoy</BotonPack>
          <BotonPack href="#informacion" tono="cristal">Solicita información</BotonPack>
        </div>
      </div>
    </aside>
  );
}
