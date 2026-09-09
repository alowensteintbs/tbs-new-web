"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { HomeButton } from "@/components/home/home-button";
import { pack } from "./contenido";
import styles from "./pack-premium.module.css";

const horarios = [
  "09:00",
  "09:15",
  "09:30",
  "09:45",
  "10:00",
  "10:15",
  "10:30",
];
const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const fechaLocal = (fecha: Date) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

function fechaDeHoy() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" });
}

function observarFecha(actualizar: () => void) {
  window.addEventListener("focus", actualizar);
  return () => window.removeEventListener("focus", actualizar);
}

export function FormularioContacto({
  agenda = false,
  fechaInicial,
}: {
  agenda?: boolean;
  fechaInicial: string;
}) {
  const id = useId();
  // Actualiza la fecha al hidratar incluso si la página se generó días antes.
  const hoy = useSyncExternalStore(
    observarFecha,
    fechaDeHoy,
    () => fechaInicial,
  );
  const [mesElegido, setMes] = useState<Date | null>(null);
  const mes = mesElegido ?? new Date(`${hoy}T12:00:00`);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("10:00");
  const [mensaje, setMensaje] = useState("");
  const primerDia =
    (new Date(mes.getFullYear(), mes.getMonth(), 1).getDay() + 6) % 7;
  const cantidadDias = new Date(
    mes.getFullYear(),
    mes.getMonth() + 1,
    0,
  ).getDate();
  const nombreMes = mes.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  const esMesInicial =
    fechaLocal(new Date(mes.getFullYear(), mes.getMonth(), 1)).slice(0, 7) <=
    hoy.slice(0, 7);

  function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (agenda && (!fecha || fecha < hoy)) {
      setMensaje("Elige un día para solicitar la llamada.");
      return;
    }
    const datos = new FormData(event.currentTarget);
    const asunto = agenda
      ? "Solicitud de llamada · Pack Premium"
      : "Información · Pack Premium";
    const cuerpo = [
      `Nombre: ${datos.get("nombre")}`,
      `Correo: ${datos.get("correo")}`,
      `Teléfono: ${datos.get("telefono")}`,
      agenda
        ? `Horario preferido: ${fecha} a las ${hora} (hora de España).`
        : "Quiero recibir más información sobre el Pack de inversión premium.",
    ].join("\n");
    window.location.href = `mailto:${pack.contacto}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    setMensaje(
      "Se ha preparado tu correo. Envíalo desde tu aplicación de email para que podamos responderte.",
    );
  }

  return (
    <form
      className={`${styles.formulario} ${agenda ? styles.formularioAgenda : styles.formularioInformacion}`}
      onSubmit={enviar}
    >
      <div className={styles.campos}>
        <label htmlFor={`${id}-nombre`}>
          Nombre y apellidos*
          <input
            id={`${id}-nombre`}
            name="nombre"
            autoComplete="name"
            required
            maxLength={120}
          />
        </label>
        <label htmlFor={`${id}-telefono`}>
          Número de teléfono*
          <input
            id={`${id}-telefono`}
            name="telefono"
            type="tel"
            autoComplete="tel"
            placeholder="+34"
            required
            maxLength={30}
          />
        </label>
        <label className={styles.correo} htmlFor={`${id}-correo`}>
          Correo*
          <input
            id={`${id}-correo`}
            name="correo"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
      </div>
      {agenda && (
        <div className={styles.selectorCita}>
          <div className={styles.calendario}>
            <div className={styles.mes}>
              <button
                type="button"
                aria-label="Mes anterior"
                disabled={esMesInicial}
                onClick={() =>
                  setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))
                }
              >
                ‹
              </button>
              <strong aria-live="polite">{nombreMes}</strong>
              <button
                type="button"
                aria-label="Mes siguiente"
                onClick={() =>
                  setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))
                }
              >
                ›
              </button>
            </div>
            <div
              className={styles.dias}
              role="group"
              aria-label="Fecha preferida para la llamada"
            >
              {diasSemana.map((dia) => (
                <span key={dia}>{dia}</span>
              ))}
              {Array.from({ length: primerDia }, (_, indice) => (
                <span key={`vacio-${indice}`} aria-hidden="true" />
              ))}
              {Array.from({ length: cantidadDias }, (_, indice) => {
                const dia = new Date(
                  mes.getFullYear(),
                  mes.getMonth(),
                  indice + 1,
                );
                const valor = fechaLocal(dia);
                return (
                  <button
                    key={valor}
                    type="button"
                    disabled={valor < hoy}
                    aria-label={dia.toLocaleDateString("es-ES", {
                      dateStyle: "full",
                    })}
                    aria-pressed={fecha === valor}
                    onClick={() => {
                      setFecha(valor);
                      setMensaje("");
                    }}
                  >
                    {indice + 1}
                  </button>
                );
              })}
            </div>
          </div>
          <fieldset className={styles.horarios}>
            <legend>Horario preferido</legend>
            {horarios.map((valor) => (
              <label key={valor}>
                <input
                  type="radio"
                  name="horario"
                  value={valor}
                  checked={hora === valor}
                  onChange={() => setHora(valor)}
                />
                <span>{valor}</span>
              </label>
            ))}
          </fieldset>
        </div>
      )}
      <div className={styles.enviar}>
        <p>
          {agenda
            ? "Elige tu horario preferido (hora de España). Te confirmaremos la disponibilidad por correo."
            : "Se abrirá tu aplicación de email con la solicitud preparada."}
        </p>
        <HomeButton
          type="submit"
          variant={agenda ? "magenta" : "green"}
          className={styles.enviarBoton}
        >
          {agenda ? "Solicitar llamada" : "Solicitar información"}
        </HomeButton>
      </div>
      <p className={styles.estadoFormulario} role="status">
        {mensaje}
      </p>
    </form>
  );
}
