import { BotonPack, Etiqueta, FormatoCurso, TituloPack } from "./elementos";
import { FormularioContacto } from "./formulario-contacto";
import { pack } from "./contenido";
import styles from "./pack-premium.module.css";

export function LlamadaSection({ fechaInicial }: { fechaInicial: string }) {
  return (
    <section className={`tbs-grid-dark ${styles.llamada}`} id="llamada">
      <div className={styles.contenedor}>
        <div>
          <Etiqueta tono="rosa">Reserva una llamada</Etiqueta>
          <h2 className={styles.tituloSeccion}>
            Te mostramos la formación en vivo y antes de comprarla.
          </h2>
          <p>
            Te mostramos la formación por dentro, resolvemos tus dudas y te
            ayudamos a descubrir si el Pack Premium encaja contigo.
          </p>
        </div>
        <FormularioContacto agenda fechaInicial={fechaInicial} />
      </div>
    </section>
  );
}

export function InscripcionSection({ fechaInicial }: { fechaInicial: string }) {
  return (
    <section className={`tbs-grid-blue ${styles.inscripcion}`} id="inscripcion">
      <div className={styles.contenedor}>
        <div className={styles.opcionesInscripcion}>
          <div>
            <Etiqueta tono="blanco">Empieza cuando quieras</Etiqueta>
            <TituloPack />
          </div>
          <div className={styles.precios}>
            {[
              { precio: pack.mensual, etiquetas: ["12 meses", "Aplazame"] },
              {
                precio: pack.completo,
                etiquetas: ["Pago único", "Garantía 15 días"],
              },
            ].map((opcion) => (
              <article key={opcion.precio}>
                <div>
                  {opcion.etiquetas.map((etiqueta) => (
                    <span key={etiqueta}>{etiqueta}</span>
                  ))}
                </div>
                <strong>{opcion.precio}</strong>
                <BotonPack href="#informacion" tono="verde">
                  Inscribirme hoy
                </BotonPack>
              </article>
            ))}
          </div>
        </div>
        <div className={styles.masInformacion} id="informacion">
          <div>
            <h2 className={styles.tituloSeccion}>Solicita más información</h2>
            <p>
              Cuéntanos tus objetivos y te ayudamos a descubrir si el Pack de
              inversión premium encaja contigo.
            </p>
            <FormularioContacto fechaInicial={fechaInicial} />
          </div>
          <div>
            <FormatoCurso claro />
            <p className={styles.ayudaInscripcion}>
              ¿Prefieres conocer la formación por dentro?
            </p>
            <BotonPack href="#llamada" tono="blanco">
              Reserva una llamada <span aria-hidden="true">↗</span>
            </BotonPack>
          </div>
        </div>
      </div>
    </section>
  );
}
