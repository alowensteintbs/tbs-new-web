import Image from "next/image";
import { PartnersStrip, VideoShowcase } from "@/components/home/video-showcase";
import { BeneficiosSection } from "../../pack-premium/_components/beneficios-section";
import { BotonPack, Etiqueta, FormatoCurso } from "../../pack-premium/_components/elementos";
import { MasInformacion } from "../../pack-premium/_components/mas-informacion";
import packStyles from "../../pack-premium/_components/pack-premium.module.css";
import { ProgramaTabs } from "../../pack-premium/_components/programa-tabs";
import tradingStyles from "../../trading/_components/trading.module.css";
import {
  aprendizajesTradingAlgoritmico,
  beneficiosTradingAlgoritmico,
  beneficiosMasterTradingAlgoritmico,
  cursoTradingAlgoritmico,
  incluyeTradingAlgoritmico,
  objetivosTradingAlgoritmico,
  razonesTradingAlgoritmico,
} from "./contenido";
import styles from "./trading-algoritmico.module.css";

export function TituloTradingAlgoritmico({
  principal = false,
}: {
  principal?: boolean;
}) {
  const Tag = principal ? "h1" : "h2";

  return (
    <Tag
      className={`${tradingStyles.tituloTrading} ${principal ? tradingStyles.tituloPrincipal : ""} ${styles.tituloAlgoritmico}`}
    >
      Curso de
      <br />
      <em>
        Trading
        <br />
        Algorítmico
      </em>
    </Tag>
  );
}

export function HeroTradingAlgoritmico() {
  return (
    <section className={`tbs-grid-dark ${tradingStyles.presentacion}`}>
      <div className={tradingStyles.contenedor}>
        <div className={tradingStyles.hero}>
          <div>
            <Etiqueta tono="lima">Plazas abiertas</Etiqueta>
            <TituloTradingAlgoritmico principal />
            <FormatoCurso />
          </div>
          <aside
            className={packStyles.resumen}
            aria-label="Qué incluye el Curso de Trading Algorítmico"
          >
            <div className={packStyles.resumenContenido}>
              <ul>
                {incluyeTradingAlgoritmico.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true">➜</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className={packStyles.precioResumen}>
                <div>
                  <strong>{cursoTradingAlgoritmico.mensual}</strong>
                  <span>/mes</span>
                </div>
                <p>{cursoTradingAlgoritmico.completo} completo</p>
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

function CaracteristicasPlan({ meses }: { meses: "6" | "12" }) {
  return (
    <div className={styles.caracteristicasPlan}>
      <span>
        <Image
          className={styles.iconoOrganizacion}
          src="/products/trading-algoritmico/programa/organization.png"
          width={34}
          height={37}
          alt=""
        />
        Acceso a Comunidad privada de Traders
      </span>
      <span>
        <Image
          className={styles.iconoPanel}
          src="/products/trading-algoritmico/programa/panel-black.png"
          width={44}
          height={36}
          alt=""
        />
        Clases grupales en directo de por vida
      </span>
      <span>
        <Image
          className={styles.iconoTeacher}
          src="/products/trading-algoritmico/programa/teacher.png"
          width={40}
          height={32}
          alt=""
        />
        <b>{meses} MESES</b> de tutorías individuales ilimitadas
      </span>
    </div>
  );
}

function CursoOMaster() {
  return (
    <section className={styles.comparacion} aria-labelledby="titulo-comparacion">
      <Etiqueta>Curso vs Master</Etiqueta>
      <h2 id="titulo-comparacion">¿Curso o Máster? Tú eliges.</h2>
      <p className={styles.introduccionComparacion}>
        Empieza con el curso o amplía tu formación con más acompañamiento,
        herramientas y práctica en el Máster.
      </p>
      <div className={styles.planes}>
        <article className={styles.plan}>
          <h3>Curso<br />Trading + IA</h3>
          <p>Aprendes a incorporar la IA en tus operaciones de trading.</p>
          <ul>
            <li>Aula virtual de por vida</li>
            <li>Acompañamiento y soporte</li>
            <li>Fiscalidad con TaxDown</li>
            <li>Asistente de IA</li>
          </ul>
          <CaracteristicasPlan meses="6" />
        </article>
        <article className={`${styles.plan} ${styles.planMaster}`}>
          <h3><em>Master</em><br />Trading + IA</h3>
          <p>
            Todo lo del curso, con más tiempo, herramientas y práctica para
            llevar tu operativa más lejos.
          </p>
          <ul>
            <li>Aula virtual de por vida</li>
            <li>Acompañamiento y soporte</li>
            <li>Fiscalidad con TaxDown</li>
            <li>Asistente de IA</li>
          </ul>
          <div className={styles.certificacion}>
            <strong>Certificación <em>universitaria</em></strong>
            <span>UTAMED</span>
          </div>
          <CaracteristicasPlan meses="12" />
          <div className={styles.bonus}><span>B</span><span>O</span><span>N</span><span>U</span><span>S</span></div>
          <div className={styles.bonusItems}>
            <strong>Robot indicadores<br />generados con IA</strong>
            <strong>Acceso a prueba de<br />fondeo de 10.000€</strong>
          </div>
        </article>
      </div>
    </section>
  );
}

export function ProgramaTradingAlgoritmico() {
  return (
    <section
      className={`tbs-grid-light ${tradingStyles.programaSeccion}`}
      id="programa"
    >
      <div className={tradingStyles.contenedor}>
        <ProgramaTabs
          etiquetaProducto="Trading Algorítmico"
          razonesPrograma={razonesTradingAlgoritmico}
          aprendizajesPrograma={aprendizajesTradingAlgoritmico}
          objetivosPrograma={objetivosTradingAlgoritmico}
        />
        <CursoOMaster />
        <BeneficiosSection
          producto="Curso de Trading Algorítmico"
          beneficiosLista={beneficiosTradingAlgoritmico}
          beneficiosMaster={beneficiosMasterTradingAlgoritmico}
        />
      </div>
    </section>
  );
}

export function InscripcionTradingAlgoritmico() {
  return (
    <section
      className={`tbs-grid-blue ${tradingStyles.inscripcion}`}
      id="inscripcion"
    >
      <div className={tradingStyles.contenedor}>
        <div className={tradingStyles.inscripcionCabecera}>
          <div>
            <Etiqueta tono="blanco">Empieza cuando quieras</Etiqueta>
            <TituloTradingAlgoritmico />
          </div>
          <div className={tradingStyles.precios}>
            <article>
              <div><span>12 meses</span><span>Aplazame</span></div>
              <strong>{cursoTradingAlgoritmico.mensual}</strong>
              <BotonPack href="#informacion" tono="verde">
                Inscribirme hoy
              </BotonPack>
            </article>
            <article>
              <div><span>Pago único</span><span>Garantía 15 días</span></div>
              <strong>{cursoTradingAlgoritmico.completo}</strong>
              <BotonPack href="#informacion" tono="verde">
                Inscribirme hoy
              </BotonPack>
            </article>
          </div>
        </div>
        <MasInformacion />
      </div>
    </section>
  );
}

export function BarraTradingAlgoritmico() {
  return (
    <aside
      className={packStyles.barraInscripcion}
      aria-label="Inscripción al Curso de Trading Algorítmico"
    >
      <div className={packStyles.contenedor}>
        <div className={packStyles.barraProducto}>
          <div className={packStyles.barraPrecio}>
            <strong>{cursoTradingAlgoritmico.mensual}</strong>
            <span>/ mes</span>
          </div>
          <p>Curso de <em>Trading Algorítmico</em></p>
        </div>
        <div className={packStyles.barraAcciones}>
          <BotonPack href="#inscripcion" tono="blanco">Inscríbete hoy</BotonPack>
          <BotonPack href="#informacion" tono="cristal">Solicita información</BotonPack>
        </div>
      </div>
    </aside>
  );
}
