import Image from "next/image";
import { PartnersStrip, VideoShowcase } from "@/components/home/video-showcase";
import { BeneficiosSection } from "../../pack-premium/_components/beneficios-section";
import { Etiqueta, BotonPack, FormatoCurso } from "../../pack-premium/_components/elementos";
import { FormularioContacto } from "../../pack-premium/_components/formulario-contacto";
import packStyles from "../../pack-premium/_components/pack-premium.module.css";
import { ProgramaTabs } from "../../pack-premium/_components/programa-tabs";
import { MasInformacion } from "../../pack-premium/_components/mas-informacion";
import { ClaseGratisDetalles } from "./clase-gratis-detalles";
import {
  aprendizajesTrading,
  beneficiosTrading,
  cursoTrading,
  incluyeTrading,
  objetivosTrading,
  razonesTrading,
} from "./contenido";
import styles from "./trading.module.css";

export function TituloTrading({ principal = false }: { principal?: boolean }) {
  const Tag = principal ? "h1" : "h2";

  return (
    <Tag className={`${styles.tituloTrading} ${principal ? styles.tituloPrincipal : ""}`}>
      Curso
      <br />
      de <em>Trading</em>
    </Tag>
  );
}

export function HeroTrading() {
  return (
    <section className={`tbs-grid-dark ${styles.presentacion}`}>
      <div className={styles.contenedor}>
        <div className={styles.hero}>
          <div>
            <Etiqueta tono="lima">Plazas abiertas</Etiqueta>
            <TituloTrading principal />
            <FormatoCurso />
          </div>
          <aside className={packStyles.resumen} aria-label="Qué incluye el Curso de Trading">
            <div className={packStyles.resumenContenido}>
              <ul>
                {incluyeTrading.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true">➜</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className={packStyles.precioResumen}>
                <div>
                  <strong>{cursoTrading.mensual}</strong>
                  <span>/mes</span>
                </div>
                <p>{cursoTrading.completo} completo</p>
              </div>
            </div>
            <div className={packStyles.accionesResumen}>
              <BotonPack href="#inscripcion">Inscribirme ahora</BotonPack>
              <BotonPack href="#informacion" tono="cristal">
                Solicitar información
              </BotonPack>
            </div>
          </aside>
        </div>
        <div className={styles.alianzas}>
          <PartnersStrip />
        </div>
      </div>
      <VideoShowcase
        showPartners={false}
        poster="/products/pack-premium/presentacion.png"
        className={`${packStyles.video} ${styles.videoTrading}`}
      />
      <div className={styles.descargarPrograma}>
        <BotonPack href="#programa" tono="rosa">
          Descargar programa <span aria-hidden="true">↓</span>
        </BotonPack>
      </div>
    </section>
  );
}

export function ProgramaTrading() {
  return (
    <section className={`tbs-grid-light ${styles.programaSeccion}`} id="programa">
      <div className={styles.contenedor}>
        <ProgramaTabs
          etiquetaProducto="Curso de Trading"
          razonesPrograma={razonesTrading}
          aprendizajesPrograma={aprendizajesTrading}
          objetivosPrograma={objetivosTrading}
        />
        <BeneficiosSection
          producto="Curso de Trading"
          beneficiosLista={beneficiosTrading}
        />
      </div>
    </section>
  );
}

export function InscripcionTrading() {
  return (
    <section className={`tbs-grid-blue ${styles.inscripcion}`} id="inscripcion">
      <div className={styles.contenedor}>
        <div className={styles.inscripcionCabecera}>
          <div>
            <Etiqueta tono="blanco">Empieza cuando quieras</Etiqueta>
            <TituloTrading />
          </div>
          <div className={styles.precios}>
            <article>
              <div><span>12 meses</span><span>Aplazame</span></div>
              <strong>{cursoTrading.mensual}</strong>
              <BotonPack href="#informacion" tono="verde">Inscribirme hoy</BotonPack>
            </article>
            <article>
              <div><span>Pago único</span><span>Garantía 15 días</span></div>
              <strong>{cursoTrading.completo}</strong>
              <BotonPack href="#informacion" tono="verde">Inscribirme hoy</BotonPack>
            </article>
          </div>
        </div>
        <MasInformacion />
      </div>
    </section>
  );
}

export function ClaseGratisTrading({
  fechaInicial,
  variante = "trading",
}: {
  fechaInicial: string;
  variante?: "trading" | "algoritmico";
}) {
  const esAlgoritmico = variante === "algoritmico";

  return (
    <section className={`tbs-grid-dark ${styles.claseGratis}`} id="clase-gratis">
      <div className={styles.contenedor}>
        <h2>¿Quieres ver<br />una clase<br /><em>totalmente gratis?</em></h2>
        <div className={styles.claseGratisGrid}>
          <div className={styles.claseImagen}>
            {esAlgoritmico ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                poster="/products/trading-algoritmico/clase-gratis.png"
                preload="metadata"
              >
                <source
                  src="/products/trading-algoritmico/algoritmico.mp4"
                  type="video/mp4"
                />
              </video>
            ) : (
              <Image
                src="/products/trading/clase-gratis.png"
                alt="Clase gratuita de Trading desde cero"
                fill
                sizes="(min-width: 900px) 50vw, calc(100vw - 48px)"
              />
            )}
          </div>
          <article
            className={`${styles.claseFormulario} ${esAlgoritmico ? styles.claseFormularioAlgoritmico : ""}`}
          >
            <Etiqueta tono="lima">Plazas disponibles</Etiqueta>
            <h3>Aprende Trading<br />desde cero</h3>
            <p>Aprende una forma estructurada de analizar oportunidades, gestionar el riesgo y empezar a invertir, incluso con poco.</p>
            <ClaseGratisDetalles />
            <FormularioContacto
              claseGratis
              fechaInicial={fechaInicial}
              hubspotForm={esAlgoritmico ? "trading-algoritmico" : "trading"}
              producto="Clase gratuita de Trading desde cero"
            />
          </article>
        </div>
      </div>
    </section>
  );
}

export function BarraTrading() {
  return (
    <aside className={packStyles.barraInscripcion} aria-label="Inscripción al Curso de Trading">
      <div className={packStyles.contenedor}>
        <div className={packStyles.barraProducto}>
          <div className={packStyles.barraPrecio}>
            <strong>{cursoTrading.mensual}</strong>
            <span>/ mes</span>
          </div>
          <p>Curso de <em>Trading</em></p>
        </div>
        <div className={packStyles.barraAcciones}>
          <BotonPack href="#inscripcion" tono="blanco">Inscríbete hoy</BotonPack>
          <BotonPack href="#informacion" tono="cristal">Solicita información</BotonPack>
        </div>
      </div>
    </aside>
  );
}
