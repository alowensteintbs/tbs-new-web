import Image from "next/image";
import { beneficios } from "./contenido";
import { Etiqueta } from "./elementos";
import styles from "./pack-premium.module.css";

export type Beneficio = {
  titulo: string;
  imagen: string;
  tipo: string;
  puntos: readonly string[];
};


export function BeneficiosSection({
  producto = "Pack Premium",
  beneficiosLista = beneficios,
}: {
  producto?: string;
  beneficiosLista?: readonly Beneficio[];
}) {
  return (
    <section className={styles.beneficios} aria-labelledby="titulo-beneficios">
      <Etiqueta>Puntos vitales</Etiqueta>
      <div className={styles.tituloCarrusel}>
        <h2 id="titulo-beneficios" className={styles.tituloSeccion}>
          Esto hace diferente tu forma de aprender.
        </h2>
      </div>
      <div
        className={styles.carruselBeneficios}
        tabIndex={0}
        role="region"
        aria-label={`Beneficios de ${producto}`}
      >
        {beneficiosLista.map((beneficio) => (
          <article key={beneficio.tipo} className={styles.tarjetaBeneficio}>
            <div className={styles.visualBeneficio} aria-hidden="true">
              <Image
                src={`/products/${beneficiosLista === beneficios ? "pack-premium" : "trading"}/beneficios/${beneficio.tipo}.png`}
                alt=""
                fill
                sizes="344px"
                className={styles.imagenBeneficio}
              />
            </div>
            <h3>{beneficio.titulo}</h3>
            <ul>
              {beneficio.puntos.map((punto) => (
                <li key={punto}>{punto}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
