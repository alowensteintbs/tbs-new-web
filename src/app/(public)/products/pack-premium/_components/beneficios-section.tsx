import Image from "next/image";
import { CarruselBeneficios } from "./carrusel-beneficios";
import { beneficios } from "./contenido";
import { Etiqueta } from "./elementos";
import { PestanasBeneficios } from "./pestanas-beneficios";
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
  beneficiosMaster,
}: {
  producto?: string;
  beneficiosLista?: readonly Beneficio[];
  beneficiosMaster?: readonly Beneficio[];
}) {
  const titulo = <h2 id="titulo-beneficios" className={styles.tituloSeccion}>
    Esto hace diferente tu forma de aprender.
  </h2>;

  return (
    <section className={styles.beneficios} aria-labelledby="titulo-beneficios">
      <Etiqueta>Puntos vitales</Etiqueta>
      {beneficiosMaster ? (
        <PestanasBeneficios titulo={titulo}
          curso={<TarjetasBeneficios producto={producto} items={beneficiosLista} />}
          master={<TarjetasBeneficios producto={`Master: ${producto}`} items={beneficiosMaster} />}
        />
      ) : (
        <>
          <div className={styles.tituloCarrusel}>{titulo}</div>
          <TarjetasBeneficios producto={producto} items={beneficiosLista} />
        </>
      )}
    </section>
  );
}

function TarjetasBeneficios({ producto, items }: { producto: string; items: readonly Beneficio[] }) {
  return (
      <CarruselBeneficios etiqueta={`Beneficios de ${producto}`}>
        {items.map((beneficio) => (
          <article key={beneficio.tipo} className={styles.tarjetaBeneficio}>
            <div className={styles.visualBeneficio} aria-hidden="true">
              <Image
                src={beneficio.imagen.startsWith("/") ? beneficio.imagen : `/products/${items === beneficios ? "pack-premium" : "trading"}/beneficios/${beneficio.tipo}.png`}
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
      </CarruselBeneficios>
  );
}
