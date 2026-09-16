import { AcreditacionSection } from "./acreditacion-section";
import styles from "./acreditacion-efpa.module.css";

export function AcreditacionEfpa() {
  return (
    <AcreditacionSection
      idTitulo="titulo-acreditacion"
      titulo={<>Para asesorar, <em>saber de inversión no es suficiente</em></>}
      subtitulo="El asesoramiento financiero es una actividad regulada."
    >
      <div className={styles.itinerario}>
        <article className={styles.mifid}>
          <h3>Normativa MiFID II</h3>
          <p>Quienes informan o asesoran sobre productos y servicios de inversión deben acreditar los conocimientos y competencias necesarios para hacerlo.</p>
        </article>
        <article>
          <span>Certificaciones EFPA</span>
          <h3>EIA</h3>
          <p>Funciones de información</p>
          <b>Reconocida en España</b>
        </article>
        <article>
          <span>Certificaciones EFPA</span>
          <h3>EIP</h3>
          <p>Funciones de asesoramiento</p>
          <b>Reconocida en España</b>
        </article>
        <article>
          <span>Certificaciones EFPA</span>
          <h3>EFA</h3>
          <p>Funciones de asesoramiento</p>
          <b>Reconocida en España</b>
        </article>
      </div>
    </AcreditacionSection>
  );
}
