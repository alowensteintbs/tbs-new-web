"use client";

import { useSyncExternalStore } from "react";
import styles from "./descuento.module.css";

const horaMadrid = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Madrid",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function suscribir(aviso: () => void) {
  const id = window.setInterval(aviso, 1000);
  return () => window.clearInterval(id);
}

const segundoActual = () => Math.floor(Date.now() / 1000);
const sinReloj = () => null;

function segundosRestantes(ahora: number, fin: string | null) {
  if (fin) return Math.max(0, Math.floor(Date.parse(fin) / 1000) - ahora);

  const [h, m, s] = horaMadrid.format(ahora * 1000).split(":").map(Number);
  return 86400 - (h * 3600 + m * 60 + s);
}

const dosCifras = (valor: number) => String(Math.min(valor, 99)).padStart(2, "0");

export function CuentaAtras({ fin }: { fin: string | null }) {
  // En servidor no hay reloj: se pinta "00" y el cliente lo actualiza cada segundo.
  const ahora = useSyncExternalStore(suscribir, segundoActual, sinReloj);
  const restantes = ahora === null ? 0 : segundosRestantes(ahora, fin);

  const bloques = [
    { valor: Math.floor(restantes / 3600), etiqueta: "Hora" },
    { valor: Math.floor((restantes % 3600) / 60), etiqueta: "Minutos" },
    { valor: restantes % 60, etiqueta: "Segundos" },
  ];

  return (
    <div
      className={styles.cuentaAtras}
      role="timer"
      aria-label="Tiempo restante de la oferta"
    >
      {bloques.map(({ valor, etiqueta }) => (
        <div key={etiqueta} className={styles.bloqueTiempo}>
          <span className={styles.digitos}>{dosCifras(valor)}</span>
          <span className={styles.etiquetaTiempo}>{etiqueta}</span>
        </div>
      ))}
    </div>
  );
}
