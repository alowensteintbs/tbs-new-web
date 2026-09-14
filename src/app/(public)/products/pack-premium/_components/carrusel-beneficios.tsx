"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import styles from "./pack-premium.module.css";

export function CarruselBeneficios({
  children,
  etiqueta,
}: {
  children: ReactNode;
  etiqueta: string;
}) {
  const carrusel = useRef<HTMLDivElement>(null);
  const arrastre = useRef<{
    pointerId: number;
    x: number;
    scrollLeft: number;
  } | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [pausado, setPausado] = useState(false);

  function desplazar(direccion: 1 | -1) {
    const elemento = carrusel.current;
    const tarjeta = elemento?.firstElementChild as HTMLElement | null;
    if (!elemento || !tarjeta) return;

    const estilos = window.getComputedStyle(elemento);
    const paso = tarjeta.offsetWidth + Number.parseFloat(estilos.columnGap || estilos.gap || "0");
    const llegoAlFinal =
      elemento.scrollLeft + elemento.clientWidth >= elemento.scrollWidth - paso / 2;

    elemento.scrollTo({
      left: direccion === 1 && llegoAlFinal ? 0 : elemento.scrollLeft + paso * direccion,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    if (pausado || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const intervalo = window.setInterval(() => desplazar(1), 4000);
    return () => window.clearInterval(intervalo);
  }, [pausado]);

  function iniciar(evento: PointerEvent<HTMLDivElement>) {
    if (evento.pointerType === "mouse" && evento.button !== 0) return;
    evento.preventDefault();
    arrastre.current = {
      pointerId: evento.pointerId,
      x: evento.clientX,
      scrollLeft: evento.currentTarget.scrollLeft,
    };
    evento.currentTarget.setPointerCapture(evento.pointerId);
    setArrastrando(true);
    setPausado(true);
  }

  function mover(evento: PointerEvent<HTMLDivElement>) {
    const inicio = arrastre.current;
    if (!inicio || inicio.pointerId !== evento.pointerId) return;
    evento.preventDefault();
    evento.currentTarget.scrollLeft =
      inicio.scrollLeft - (evento.clientX - inicio.x);
  }

  function terminar(evento: PointerEvent<HTMLDivElement>) {
    if (arrastre.current?.pointerId !== evento.pointerId) return;
    arrastre.current = null;
    setArrastrando(false);
    setPausado(false);
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
  }

  function teclado(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") return;
    evento.preventDefault();
    desplazar(evento.key === "ArrowRight" ? 1 : -1);
  }

  return (
    <div
      ref={carrusel}
      className={`${styles.carruselBeneficios} ${arrastrando ? styles.carruselArrastrando : ""}`}
      tabIndex={0}
      role="region"
      aria-label={etiqueta}
      onPointerDown={iniciar}
      onPointerMove={mover}
      onPointerUp={terminar}
      onPointerCancel={terminar}
      onLostPointerCapture={terminar}
      onDragStart={(evento) => evento.preventDefault()}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      onKeyDown={teclado}
    >
      {children}
    </div>
  );
}
