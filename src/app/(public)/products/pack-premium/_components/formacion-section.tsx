import Image from "next/image";
import { cursos } from "./contenido";
import { Etiqueta } from "./elementos";
import { ProgramaTabs } from "./programa-tabs";
import { BeneficiosSection } from "./beneficios-section";
import styles from "./pack-premium.module.css";

export function CertificacionSection() {
  return (
    <section
      className={`tbs-grid-light ${styles.certificacion}`}
      aria-labelledby="titulo-certificacion"
    >
      <div className={styles.contenedor}>
        <div className={styles.certificacionCabecera}>
          <div>
            <h2 id="titulo-certificacion" className={styles.tituloSeccion}>
              Tendrás certificación <em>universitaria</em>
            </h2>
            <p>
              Somos la única escuela de trading e inversión en España con
              titulación universitaria con créditos ECTS.
            </p>
          </div>
          <div className={styles.universidad}>
            <Image
              src="/home/ecosystem/utamed.svg"
              alt="UTAMED Universidad"
              width={173}
              height={48}
            />
            <p>
              Universidad online
              <br />
              del grupo Unicaja
            </p>
          </div>
        </div>
        <div className={styles.titulaciones}>
          <ul>
            {[
              "Sin coste adicional de expedición",
              "Créditos ECTS europeos",
              "Respaldado por Unicaja",
              "Válido para CV y LinkedIn",
            ].map((texto) => (
              <li key={texto}>{texto}</li>
            ))}
          </ul>
          <article>
            <div>
              <h3>Máster de formación permanente</h3>
              <span>Máster</span>
            </div>
            <p>Para titulados universitarios</p>
            <strong>60 créditos ECTS</strong>
          </article>
          <article>
            <div>
              <h3>Curso de estudios avanzados</h3>
              <span>Curso</span>
            </div>
            <p>Para no titulados universitarios</p>
            <strong>60 créditos ECTS</strong>
          </article>
        </div>
      </div>
    </section>
  );
}

export function FormacionSection() {
  return (
    <section className={`tbs-grid-light ${styles.formacion}`} id="contenido">
      <div className={styles.contenedor}>
        <Etiqueta>Cripto + acciones + trading + IA</Etiqueta>
        <h2 className={styles.tituloSeccion}>
          Cuatro formas de invertir. Un pack.
        </h2>
        <div className={styles.cursos}>
          {cursos.map((curso) => (
            <article key={curso.titulo}>
              <Image
                src={`/home/courses/${curso.imagen}`}
                alt=""
                width={294}
                height={230}
              />
              <div>
                <p>Formación en</p>
                <h3>{curso.titulo}</h3>
              </div>
              <p>{curso.descripcion}</p>
            </article>
          ))}
        </div>
        <ProgramaTabs />
        <BeneficiosSection />
      </div>
    </section>
  );
}
