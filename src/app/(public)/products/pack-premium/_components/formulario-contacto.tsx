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
const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
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
  producto = "Pack Premium",
  claseGratis = false,
  ocultarDatosContacto = false,
}: {
  agenda?: boolean;
  fechaInicial: string;
  producto?: string;
  claseGratis?: boolean;
  ocultarDatosContacto?: boolean;
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
  const [prefijo, setPrefijo] = useState("+34");
  const primerDia =
    new Date(mes.getFullYear(), mes.getMonth(), 1).getDay();
  const cantidadDias = new Date(
    mes.getFullYear(),
    mes.getMonth() + 1,
    0,
  ).getDate();
  const nombreMes = mes.toLocaleDateString("es-ES", {
    month: "long",
  });
  const tituloMes = `${nombreMes} ${mes.getFullYear()}`;
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
      ? `Solicitud de llamada · ${producto}`
      : `Información · ${producto}`;
    const cuerpo = [
      ...(!ocultarDatosContacto ? [
        `Nombre: ${datos.get("nombre")}`,
        `Correo: ${datos.get("correo")}`,
        `Teléfono: ${prefijo} ${datos.get("telefono")}`,
      ] : []),
      agenda
        ? `Horario preferido: ${fecha} a las ${hora} (hora de España).`
        : `Quiero recibir más información sobre ${producto}.`,
    ].join("\n");
    window.location.href = `mailto:${pack.contacto}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    setMensaje(
      "Se ha preparado tu correo. Envíalo desde tu aplicación de email para que podamos responderte.",
    );
  }

  return (
    <form
      className={`${styles.formulario} ${agenda ? styles.formularioAgenda : styles.formularioInformacion} ${claseGratis ? styles.formularioClaseGratis : ""} ${ocultarDatosContacto ? styles.formularioAgendaCompacta : ""}`}
      onSubmit={enviar}
    >
      {!ocultarDatosContacto && <div className={styles.campos}>
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
          <div className={styles.telefonoCampo}>
          <select aria-label="País del teléfono" value={prefijo} onChange={(event) => setPrefijo(event.target.value)}>
            <option value="+34">España</option>
            <option value="+54">Argentina</option>
            <option value="+52">México</option>
            <option value="+57">Colombia</option>
            <option value="+56">Chile</option>
            <option value="+51">Perú</option>
            <option value="+1">EE. UU.</option>
            <option value="">Otro</option>
          </select>
          <input
            id={`${id}-telefono`}
            name="telefono"
            type="tel"
            autoComplete="tel"
            placeholder={prefijo || "Prefijo y número"}
            required
            maxLength={30}
          />
          </div>
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
      </div>}
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
              <strong aria-live="polite">{tituloMes}</strong>
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
                <span>{valor} AM</span>
              </label>
            ))}
          </fieldset>
        </div>
      )}
      {claseGratis && (
        <label className={styles.consentimiento}>
          <input type="checkbox" required name="consentimiento" />
          He leído y acepto los Términos y condiciones y la Política de privacidad.
        </label>
      )}
      <div className={styles.enviar}>
        {!claseGratis && <p>
          {agenda
            ? fecha
              ? `Horario seleccionado: ${fecha.split("-").reverse().join("/")} a las ${hora} AM (hora de España).`
              : "Elige una fecha y un horario para tu llamada (hora de España)."
            : "Se abrirá tu aplicación de email con la solicitud preparada."}
        </p>}
        <HomeButton
          type="submit"
          variant={agenda ? "magenta" : "green"}
          className={styles.enviarBoton}
        >
          {agenda ? "Continuar" : claseGratis ? "Apuntarme" : "Solicitar información"}
        </HomeButton>
      </div>
      <p className={styles.estadoFormulario} role="status">
        {mensaje}
      </p>
    </form>
  );
}
