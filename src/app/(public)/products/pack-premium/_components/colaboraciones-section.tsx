import Image from "next/image";
import { Etiqueta } from "./elementos";
import styles from "./pack-premium.module.css";

export function ColaboracionesSection() {
  return (
    <section className={`tbs-grid-dark ${styles.colaboraciones}`}>
      <div className={styles.contenedor}>
        <Etiqueta tono="blanco">Método + respaldo = seguridad</Etiqueta>
        <h2 className={styles.tituloSeccion}>
          Colaboramos con <em>los mejores</em>
        </h2>
        <article className={styles.colaborador}>
          <div className={styles.fotoColaborador}>
            <Image
              src="/products/pack-premium/renta4.png"
              alt="Oficina de Renta 4 Banco"
              fill
              sizes="(min-width: 1024px) 440px, 100vw"
            />
          </div>
          <div className={styles.colaboradorContenido}>
            <span className={styles.socio}>Socio inversor</span>
            <Image
              src="/home/ecosystem/renta4.svg"
              alt="Renta 4 Banco"
              width={280}
              height={40}
              className={styles.logoColaborador}
            />
            <p>
              Renta4, referente en servicios de inversión desde 1986, ha
              invertido 1 millón de euros en TBS y se suma a nuestra apuesta por
              hacer la educación financiera más accesible.
            </p>
            <div className={styles.alianza}>
              <h3>Esta alianza es la clave:</h3>
              <ul>
                <li>Enfoque innovador de TBS</li>
                <li>Experiencia y solidez en los mercados</li>
                <li>Programas más robustos y accesibles</li>
              </ul>
            </div>
          </div>
        </article>
        <article
          className={`${styles.colaborador} ${styles.colaboradorTaxdown}`}
        >
          <div className={styles.fotoColaborador}>
            <Image
              src="/products/pack-premium/taxdown.png"
              alt="Equipo de TaxDown"
              fill
              sizes="(min-width: 1024px) 520px, 100vw"
            />
          </div>
          <div className={styles.colaboradorContenido}>
            <span className={styles.socio}>Colaboración estratégica</span>
            <Image
              src="/home/ecosystem/taxdown.svg"
              alt="TaxDown"
              width={270}
              height={42}
              className={styles.logoColaborador}
            />
            <p>
              Su equipo se encarga de impartir los módulos de fiscalidad dentro
              de nuestras formaciones para sumar conocimiento especializado.
            </p>
            <div className={styles.alianza}>
              <h3>La fiscalidad también forma parte del método.</h3>
              <p>
                Aprende cómo afectan los impuestos a tus inversiones de la mano
                de especialistas.
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
