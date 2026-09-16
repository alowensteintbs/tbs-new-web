import type { ReactNode } from "react";
import styles from "./acreditacion-section.module.css";

export function AcreditacionSection({
  idTitulo,
  titulo,
  subtitulo,
  lateral,
  children,
  variante = "regulatoria",
}: {
  idTitulo: string;
  titulo: ReactNode;
  subtitulo: ReactNode;
  lateral?: ReactNode;
  children: ReactNode;
  variante?: "regulatoria" | "universitaria";
}) {
  return (
    <section
      className={styles.seccion}
      aria-labelledby={idTitulo}
      data-variante={variante}
    >
      <div className={styles.contenido}>
        <header className={styles.cabecera}>
          <div>
            <h2 id={idTitulo}>{titulo}</h2>
            <p>{subtitulo}</p>
          </div>
          {lateral}
        </header>
        {children}
      </div>
    </section>
  );
}
