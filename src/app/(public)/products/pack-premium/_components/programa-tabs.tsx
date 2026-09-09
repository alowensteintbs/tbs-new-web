"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { aprendizajes, objetivos, razones } from "./contenido";
import styles from "./pack-premium.module.css";

const pestanas = [
  {
    id: "por-que",
    etiqueta: "Por qué este curso",
    titulo: "¿Por qué este curso?",
  },
  {
    id: "aprender",
    etiqueta: "Qué vas a aprender",
    titulo: "¿Qué vas a aprender?",
  },
  { id: "lograr", etiqueta: "Qué vas a lograr", titulo: "¿Qué vas a lograr?" },
];

export function ProgramaTabs() {
  const [activa, setActiva] = useState(0);
  const botones = useRef<(HTMLButtonElement | null)[]>([]);

  function cambiarConTeclado(event: React.KeyboardEvent, indice: number) {
    let siguiente: number;
    if (event.key === "ArrowRight") siguiente = (indice + 1) % pestanas.length;
    else if (event.key === "ArrowLeft")
      siguiente = (indice + pestanas.length - 1) % pestanas.length;
    else if (event.key === "Home") siguiente = 0;
    else if (event.key === "End") siguiente = pestanas.length - 1;
    else return;
    event.preventDefault();
    setActiva(siguiente);
    botones.current[siguiente]?.focus();
  }

  return (
    <div className={styles.programa} id="programa">
      <div className={styles.programaCabecera}>
        <div
          className={styles.pestanas}
          role="tablist"
          aria-label="Contenido del Pack Premium"
        >
          {pestanas.map((pestana, indice) => (
            <button
              key={pestana.id}
              type="button"
              role="tab"
              id={`tab-${pestana.id}`}
              aria-controls={`panel-${pestana.id}`}
              aria-selected={activa === indice}
              tabIndex={activa === indice ? 0 : -1}
              ref={(elemento) => {
                botones.current[indice] = elemento;
              }}
              onClick={() => setActiva(indice)}
              onKeyDown={(event) => cambiarConTeclado(event, indice)}
            >
              {pestana.etiqueta}
            </button>
          ))}
        </div>
        <span>Pack de inversión premium</span>
      </div>
      {pestanas.map((pestana, indice) => (
        <div
          key={pestana.id}
          id={`panel-${pestana.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${pestana.id}`}
          hidden={activa !== indice}
          tabIndex={0}
        >
          <h2>{pestana.titulo}</h2>
          {indice === 0 ? (
            <div className={styles.razones}>
              {razones.map((razon) => (
                <article key={razon.titulo}>
                  <Image
                    src={`/home/learning/${razon.icono}`}
                    width={24}
                    height={24}
                    alt=""
                  />
                  <h3>{razon.titulo}</h3>
                  <p>{razon.texto}</p>
                </article>
              ))}
            </div>
          ) : (
            <ul className={styles.listaPrograma}>
              {(indice === 1 ? aprendizajes : objetivos).map((texto) => (
                <li key={texto}>
                  <span aria-hidden="true">↗</span>
                  {texto}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
