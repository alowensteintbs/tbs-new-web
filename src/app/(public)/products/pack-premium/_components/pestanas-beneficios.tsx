"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./pack-premium.module.css";

export function PestanasBeneficios({ titulo, curso, master }: {
  titulo: ReactNode;
  curso: ReactNode;
  master: ReactNode;
}) {
  const id = useId();
  const [activa, setActiva] = useState(0);
  const botones = useRef<(HTMLButtonElement | null)[]>([]);

  function teclado(evento: KeyboardEvent<HTMLButtonElement>) {
    let siguiente: number;
    if (evento.key === "ArrowRight" || evento.key === "ArrowLeft") siguiente = 1 - activa;
    else if (evento.key === "Home") siguiente = 0;
    else if (evento.key === "End") siguiente = 1;
    else return;
    evento.preventDefault();
    setActiva(siguiente);
    botones.current[siguiente]?.focus();
  }

  return (
    <>
      <div className={`${styles.tituloCarrusel} ${styles.tituloCarruselConPestanas}`}>
        {titulo}
        <div className={styles.pestanasBeneficios} role="tablist" aria-label="Beneficios de Curso o Master">
          {["Curso", "Master"].map((nombre, indice) => (
            <button key={nombre} type="button" role="tab"
              id={`${id}-tab-${indice}`} aria-controls={`${id}-panel-${indice}`}
              aria-selected={activa === indice} tabIndex={activa === indice ? 0 : -1}
              ref={(boton) => { botones.current[indice] = boton; }}
              onClick={() => setActiva(indice)} onKeyDown={teclado}>
              {nombre}
            </button>
          ))}
        </div>
      </div>
      <div key={activa} role="tabpanel" id={`${id}-panel-${activa}`} aria-labelledby={`${id}-tab-${activa}`}>
        {activa === 0 ? curso : master}
      </div>
    </>
  );
}
