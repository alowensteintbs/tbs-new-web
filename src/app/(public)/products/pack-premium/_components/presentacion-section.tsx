import { PartnersStrip, VideoShowcase } from "@/components/home/video-showcase";
import { BotonPack, Etiqueta, FormatoCurso, TituloPack } from "./elementos";
import { incluye, pack } from "./contenido";
import styles from "./pack-premium.module.css";

export function PresentacionSection() {
  return (
    <section className={`tbs-grid-dark ${styles.presentacion}`}>
      <div className={styles.contenedor}>
        <div className={styles.hero}>
          <div>
            <Etiqueta tono="lima">Plazas abiertas</Etiqueta>
            <TituloPack principal />
            <FormatoCurso />
          </div>
          <aside
            className={styles.resumen}
            aria-label="Qué incluye el Pack Premium"
          >
            <div className={styles.resumenContenido}>
              <ul>
                {incluye.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true">➜</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className={styles.precioResumen}>
                <div>
                  <strong>{pack.mensual}</strong>
                  <span>/mes</span>
                </div>
                <p>{pack.completo} completo</p>
              </div>
            </div>
            <div className={styles.accionesResumen}>
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
        className={styles.video}
      />
      <div className={styles.verPrograma}>
        <BotonPack href="#programa" tono="rosa">
          Ver el programa <span aria-hidden="true">↓</span>
        </BotonPack>
      </div>
    </section>
  );
}

export function BarraInscripcion() {
  return (
    <aside
      className={styles.barraInscripcion}
      aria-label="Inscripción al Pack Premium"
    >
      <div className={styles.contenedor}>
        <div className={styles.barraProducto}>
          <div className={styles.barraPrecio}>
            <strong>{pack.mensual}</strong>
            <span>/ mes</span>
          </div>
          <p>
            Pack de inversión <em>premium</em>
          </p>
        </div>
        <div className={styles.barraAcciones}>
          <BotonPack href="#inscripcion" tono="blanco">
            Inscríbete hoy
          </BotonPack>
          <BotonPack href="#informacion" tono="cristal">
            Solicita información
          </BotonPack>
        </div>
      </div>
    </aside>
  );
}
