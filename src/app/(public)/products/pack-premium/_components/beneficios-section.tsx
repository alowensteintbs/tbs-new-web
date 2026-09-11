"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { beneficios } from "./contenido";
import { Etiqueta } from "./elementos";
import styles from "./pack-premium.module.css";

function VisualBeneficio({
  beneficio,
}: {
  beneficio: (typeof beneficios)[number];
}) {
  return (
    <div
      className={`${styles.visualBeneficio} ${styles[beneficio.tipo]}`}
      aria-hidden="true"
    >
      {beneficio.imagen && (
        <Image
          src={`/products/pack-premium/${beneficio.imagen}`}
          alt=""
          fill
          sizes="(max-width: 600px) 280px, 344px"
          className={styles.imagenBeneficio}
        />
      )}
      {beneficio.tipo === "tutorias" && (
        <span className={styles.enDirecto}>● Videollamada en curso</span>
      )}
      {(beneficio.tipo === "operativa" || beneficio.tipo === "indicadores") && (
        <div className={styles.grafico}>
          {[25, 38, 32, 46, 55, 42, 59, 65, 72, 67, 83, 94].map(
            (valor, indice) => (
              <i
                key={indice}
                style={{
                  bottom: `${valor * 0.7}%`,
                  height: `${14 + (indice % 3) * 4}%`,
                  left: `${5 + indice * 7.5}%`,
                }}
              />
            ),
          )}
        </div>
      )}
      {beneficio.tipo === "asistente" && (
        <div className={styles.asistenteTexto}>
          <div>
            <Image
              src="/home/learning/icon-ai.svg"
              alt=""
              width={30}
              height={30}
            />
            Asistente
          </div>
          <p>
            ¡Hola! Soy tu asistente virtual. Pregunta lo que quieras. Estoy aquí
            para ayudarte.
          </p>
          <span>
            Quiero saber… <b>→</b>
          </span>
        </div>
      )}
      {beneficio.tipo === "fiscalidad" && (
        <Image
          src="/home/ecosystem/taxdown.svg"
          alt=""
          width={240}
          height={40}
        />
      )}
      {beneficio.tipo === "aula" && (
        <>
          <Image
            src="/home/learning/illustration-desk.svg"
            alt=""
            width={280}
            height={220}
          />
          <strong>
            Aula virtual
            <br />
            de por vida
          </strong>
        </>
      )}
      {beneficio.tipo === "soporte" && (
        <>
          <span className={styles.mensajeSoporte}>Hola, tengo una duda…</span>
          <span className={styles.respuestaSoporte}>
            ¡Estamos para ayudarte!
          </span>
          <Image
            src="/home/learning/icon-tutoring.svg"
            alt=""
            width={60}
            height={60}
          />
        </>
      )}
    </div>
  );
}

export function BeneficiosSection() {
  const carrusel = useRef<HTMLDivElement>(null);
  const inicioArrastre = useRef<{
    pointerId: number;
    x: number;
    scrollLeft: number;
  } | null>(null);
  const [arrastrando, setArrastrando] = useState(false);

  useEffect(() => {
    const elemento = carrusel.current;
    if (!elemento || arrastrando) return;

    const avanzar = () => {
      const tarjeta = elemento.firstElementChild;
      const paso = tarjeta?.getBoundingClientRect().width ?? 376;
      const llegaAlFinal =
        elemento.scrollLeft + elemento.clientWidth >=
        elemento.scrollWidth - paso;

      elemento.scrollTo({
        left: llegaAlFinal ? 0 : elemento.scrollLeft + paso + 12,
        behavior: "smooth",
      });
    };

    const temporizador = window.setInterval(avanzar, 4000);
    return () => window.clearInterval(temporizador);
  }, [arrastrando]);

  const iniciarArrastre = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    inicioArrastre.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setArrastrando(true);
  };

  const arrastrar = (event: React.PointerEvent<HTMLDivElement>) => {
    const inicio = inicioArrastre.current;
    if (!inicio || inicio.pointerId !== event.pointerId) return;
    event.currentTarget.scrollLeft =
      inicio.scrollLeft - (event.clientX - inicio.x);
  };

  const terminarArrastre = (event: React.PointerEvent<HTMLDivElement>) => {
    if (inicioArrastre.current?.pointerId !== event.pointerId) return;
    inicioArrastre.current = null;
    setArrastrando(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className={styles.beneficios} aria-labelledby="titulo-beneficios">
      <Etiqueta>Puntos vitales</Etiqueta>
      <div className={styles.tituloCarrusel}>
        <h2 id="titulo-beneficios" className={styles.tituloSeccion}>
          Esto hace diferente tu forma de aprender.
        </h2>
      </div>
      <div
        ref={carrusel}
        className={`${styles.carruselBeneficios} ${
          arrastrando ? styles.arrastrando : ""
        }`}
        tabIndex={0}
        role="region"
        aria-label="Beneficios del Pack Premium"
        aria-roledescription="carousel"
        onPointerDown={iniciarArrastre}
        onPointerMove={arrastrar}
        onPointerUp={terminarArrastre}
        onPointerCancel={terminarArrastre}
      >
        {beneficios.map((beneficio) => (
          <article key={beneficio.tipo} className={styles.tarjetaBeneficio}>
            <VisualBeneficio beneficio={beneficio} />
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
