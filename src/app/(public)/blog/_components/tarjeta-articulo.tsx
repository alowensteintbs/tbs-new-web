import Image from "next/image";
import Link from "next/link";
import type { ArticuloBlog } from "./contenido";
import styles from "./blog.module.css";

export function TarjetaArticulo({ articulo, destacada = false }: {
  articulo: ArticuloBlog;
  destacada?: boolean;
}) {
  const contenido = (
    <>
      <div className={`tbs-checkerboard ${styles.imagen}`} aria-hidden="true">
        {articulo.imagen && <Image src={articulo.imagen} alt="" fill sizes="(min-width: 1280px) 580px, (min-width: 768px) 50vw, 100vw" className="object-cover" />}
      </div>
      <div className={styles.textoTarjeta}>
        <h3>{articulo.titulo}</h3>
        {!destacada && <p>{articulo.descripcion}</p>}
        <span className={styles.leer} aria-hidden="true">Leer <span>→</span></span>
      </div>
    </>
  );

  return (
    <article className={destacada ? styles.destacada : styles.tarjeta}>
      {articulo.href ? <Link href={articulo.href} className={styles.enlace}>{contenido}</Link> : (
        <div className={styles.enlace}>
          {contenido}
          <span className="sr-only">Artículo de muestra, pendiente de publicación.</span>
        </div>
      )}
    </article>
  );
}
