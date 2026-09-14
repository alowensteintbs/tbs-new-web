"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";
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

const filasRazones = [[0, 1], [3, 2], [4, 5]];
const iconosRazones = ["directions", "zoom-in-outline", "combine-columns-outline", "process-chart-rounded", "eye-tracking-outline", "gesture-select-outline-rounded"];

type RazonPrograma = (typeof razones)[number];
type AprendizajePrograma = (typeof aprendizajes)[number];
type ObjetivoPrograma = (typeof objetivos)[number];

function RazonesMobile({ items }: { items: readonly RazonPrograma[] }) {
  const [abiertas, setAbiertas] = useState([0, 1, 0]);

  return (
    <div className={styles.razonesMobile}>
      {(items === razones ? filasRazones : [[0, 1], [3, 4], [2, 5]]).map((fila, indiceFila) => (
        <div className={styles.filaRazones} key={indiceFila} data-abierta={abiertas[indiceFila]}>
          {fila.map((indiceRazon, columna) => {
            const razon = items[indiceRazon];
            const abierta = abiertas[indiceFila] === columna;
            return (
              <button
                className={styles.razonMobile}
                key={indiceRazon}
                type="button"
                aria-label={razon.titulo}
                aria-expanded={abierta}
                aria-controls={`razon-mobile-${indiceRazon}`}
                onClick={() => setAbiertas((actuales) => actuales.map((actual, indice) => indice === indiceFila ? columna : actual))}
              >
                <Image src={razon.icono.startsWith("/") ? razon.icono : `/products/pack-premium/programa/${iconosRazones[indiceRazon]}${items === razones ? "-figma" : ""}.svg`} width={24} height={24} alt="" />
                <span className={styles.contenidoRazon} id={`razon-mobile-${indiceRazon}`} aria-hidden={!abierta}>
                  <span className={styles.tituloRazon}>{razon.titulo}</span>
                  <span className={styles.textoRazon}>{razon.texto}</span>
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function ProgramaTabs({
  etiquetaProducto = "Pack de inversión premium",
  razonesPrograma = razones,
  aprendizajesPrograma = aprendizajes,
  objetivosPrograma = objetivos,
}: {
  etiquetaProducto?: string;
  razonesPrograma?: readonly RazonPrograma[];
  aprendizajesPrograma?: readonly AprendizajePrograma[];
  objetivosPrograma?: readonly ObjetivoPrograma[];
}) {
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
    <div className={styles.programa} id="programa" data-pestana={pestanas[activa].id}>
      <div className={styles.programaCabecera}>
        <div
          className={styles.pestanas}
          role="tablist"
          aria-label={`Contenido de ${etiquetaProducto}`}
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
        <span>{etiquetaProducto}</span>
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
          <h2>{indice === 0 ? pestana.titulo : <>¿Qué vas<br />{indice === 1 ? "a aprender?" : "a lograr?"}</>}</h2>
          {indice === 0 ? (
            <>
            <div className={styles.razones}>
              {razonesPrograma.map((razon, indiceRazon) => (
                <article key={razon.titulo}>
                  <Image
                    src={razonesPrograma === razones
                      ? `/products/pack-premium/programa/${iconosRazones[indiceRazon]}-figma.svg`
                      : razon.icono.startsWith("/") ? razon.icono : `/home/learning/${razon.icono}`}
                    width={24}
                    height={24}
                    alt=""
                  />
                  <h3>{razon.titulo}</h3>
                  <p>{razon.texto}</p>
                </article>
              ))}
            </div>
            <RazonesMobile items={razonesPrograma} />
            </>
          ) : indice === 1 ? (
            <>
            <div className={styles.aprendizajes}>
              {aprendizajesPrograma.map((aprendizaje) => (
                <article key={aprendizaje.titulo}>
                  <h3>{aprendizaje.titulo}</h3>
                  <p>{aprendizaje.texto}</p>
                </article>
              ))}
            </div>
            <div className={styles.aprendizajesMobile}>
              {aprendizajesPrograma.map((aprendizaje) => (
                <details key={aprendizaje.titulo}>
                  <summary>
                    <span>{aprendizaje.titulo}</span>
                    <span className={styles.indicadorAprendizaje} aria-hidden="true" />
                  </summary>
                  <p>{aprendizaje.texto}</p>
                </details>
              ))}
            </div>
            </>
          ) : (
            <ul className={styles.objetivos}>
              {objetivosPrograma.map((objetivo) => (
                <li key={objetivo.texto}>
                  <span
                    className={styles.iconoObjetivo}
                    aria-hidden="true"
                    style={{ "--icono": `url("/products/pack-premium/programa/${objetivo.icono}.svg")` } as CSSProperties}
                  />
                  <span>{objetivo.texto}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
