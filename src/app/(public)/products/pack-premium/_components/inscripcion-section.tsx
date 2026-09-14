import { BotonPack, Etiqueta, TituloPack } from "./elementos";
import { MasInformacion } from "./mas-informacion";
import { FormularioContacto } from "./formulario-contacto";
import { pack } from "./contenido";
import styles from "./pack-premium.module.css";

export function LlamadaSection({
  fechaInicial,
  producto = "Pack Premium",
}: {
  fechaInicial: string;
  producto?: string;
}) {
  return (
    <section className={`tbs-grid-dark ${styles.llamada}`} id="llamada">
      <div className={styles.contenedor}>
        <div>
          <Etiqueta tono="rosa">Reserva una llamada</Etiqueta>
          <h2 className={styles.tituloSeccion}>
            Te mostramos la formación en vivo y antes de comprarla.
          </h2>
          <p>
            Cuéntanos qué quieres conseguir, resuelve tus dudas y descubre qué
            formación encaja mejor contigo.
          </p>
        </div>
        <FormularioContacto agenda fechaInicial={fechaInicial} producto={producto} />
      </div>
    </section>
  );
}

export function InscripcionSection() {
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
        <MasInformacion />
      </div>
    </section>
  );
}
