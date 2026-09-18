"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { HomeButton } from "@/components/home/home-button";
import type { HubSpotFormKey } from "@/lib/hubspot-config";
import styles from "./pack-premium.module.css";

const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const fechaLocal = (fecha: Date) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
const mesLocal = (fecha: Date) => fechaLocal(fecha).slice(0, 7);

function fechaDeHoy() {
  return fechaLocal(new Date());
}

function observarFecha(actualizar: () => void) {
  window.addEventListener("focus", actualizar);
  return () => window.removeEventListener("focus", actualizar);
}

function etiquetaHora(startTime: string) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startTime));
}

function normalizarTelefono(prefijo: string, numero: FormDataEntryValue | null) {
  const limpio = String(numero ?? "").replace(/[^\d+]/g, "");
  if (limpio.startsWith("+")) return limpio;
  return `${prefijo}${limpio}`;
}

export function FormularioContacto({
  agenda = false,
  fechaInicial,
  producto = "Pack Premium",
  claseGratis = false,
  ocultarDatosContacto = false,
  landingSlug,
  hubspotForm,
}: {
  agenda?: boolean;
  fechaInicial: string;
  producto?: string;
  claseGratis?: boolean;
  ocultarDatosContacto?: boolean;
  landingSlug?: string;
  hubspotForm?: HubSpotFormKey;
}) {
  const id = useId();
  const hoy = useSyncExternalStore(observarFecha, fechaDeHoy, () => fechaInicial);
  const [mesElegido, setMes] = useState<Date | null>(null);
  const mes = mesElegido ?? new Date(`${hoy}T12:00:00`);
  const [fecha, setFecha] = useState("");
  const [slotSeleccionado, setSlotSeleccionado] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(agenda);
  const [actualizacion, setActualizacion] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [envioConfirmado, setEnvioConfirmado] = useState(false);
  const [mostrarDatos, setMostrarDatos] = useState(!ocultarDatosContacto);
  const [mensaje, setMensaje] = useState("");
  const [prefijo, setPrefijo] = useState("+34");
  const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1).getDay();
  const cantidadDias = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  const tituloMes = mes.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const claveMes = mesLocal(mes);
  const esMesInicial = mesLocal(mes) <= hoy.slice(0, 7);
  const horariosDelDia = slots.filter((slot) => fechaLocal(new Date(slot)) === fecha);

  useEffect(() => {
    if (!agenda || !landingSlug) return;
    const controller = new AbortController();

    async function cargar() {
      setCargandoHorarios(true);
      try {
        const response = await fetch(
          `/api/calendly/availability?landing=${encodeURIComponent(landingSlug!)}&month=${claveMes}`,
          { signal: controller.signal, cache: "no-store" },
        );
        const payload = (await response.json()) as { slots?: string[]; error?: string };
        if (!response.ok || !payload.slots) {
          throw new Error(payload.error ?? "No pudimos consultar los horarios.");
        }
        setSlots(payload.slots);
        setFecha("");
        setSlotSeleccionado("");
        setMensaje("");
      } catch (cause) {
        if (controller.signal.aborted) return;
        setSlots([]);
        setMensaje(cause instanceof Error ? cause.message : "No pudimos consultar los horarios disponibles.");
      } finally {
        if (!controller.signal.aborted) setCargandoHorarios(false);
      }
    }

    cargar();
    return () => controller.abort();
  }, [agenda, landingSlug, claveMes, actualizacion]);

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const datos = new FormData(event.currentTarget);

    if (!agenda) {
      if (!hubspotForm) {
        setMensaje("No hay un formulario de HubSpot asociado a esta página.");
        return;
      }
      setEnviando(true);
      setMensaje("");
      try {
        const response = await fetch("/api/hubspot/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            form: hubspotForm,
            name: datos.get("nombre"),
            email: datos.get("correo"),
            phone: normalizarTelefono(prefijo, datos.get("telefono")),
            consent: datos.get("consentimiento") === "on",
            website: datos.get("website"),
          }),
        });
        const payload = (await response.json()) as { ok?: boolean; error?: string };
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "No pudimos registrar tus datos.");
        }
        setEnvioConfirmado(true);
        setMensaje(`¡Listo! Registramos tu interés en ${producto}. Revisa tu correo para continuar.`);
      } catch (cause) {
        setMensaje(cause instanceof Error ? cause.message : "No pudimos registrar tus datos en este momento.");
      } finally {
        setEnviando(false);
      }
      return;
    }

    if (!slotSeleccionado) {
      setMensaje("Elige un día y un horario disponible para la llamada.");
      return;
    }
    if (!mostrarDatos) {
      setMostrarDatos(true);
      setMensaje("Completa tus datos para confirmar la reserva.");
      return;
    }
    if (!landingSlug) {
      setMensaje("No hay un calendario asociado a esta página.");
      return;
    }

    setEnviando(true);
    setMensaje("");
    try {
      const response = await fetch("/api/calendly/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landing: landingSlug,
          startTime: slotSeleccionado,
          name: datos.get("nombre"),
          email: datos.get("correo"),
          phone: normalizarTelefono(prefijo, datos.get("telefono")),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Madrid",
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; refreshAvailability?: boolean };
      if (!response.ok || !payload.ok) {
        if (payload.refreshAvailability) setActualizacion((value) => value + 1);
        throw new Error(payload.error ?? "No pudimos confirmar la llamada.");
      }
      setEnvioConfirmado(true);
      setMensaje(`Llamada reservada para el ${fecha.split("-").reverse().join("/")} a las ${etiquetaHora(slotSeleccionado)}. Recibirás la confirmación por correo.`);
    } catch (cause) {
      setMensaje(cause instanceof Error ? cause.message : "No pudimos confirmar la llamada en este momento.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      className={`${styles.formulario} ${agenda ? styles.formularioAgenda : styles.formularioInformacion} ${claseGratis ? styles.formularioClaseGratis : ""} ${ocultarDatosContacto ? styles.formularioAgendaCompacta : ""}`}
      onSubmit={enviar}
    >
      <input className={styles.campoTrampa} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {mostrarDatos && !envioConfirmado && <div className={styles.campos}>
        <label htmlFor={`${id}-nombre`}>
          Nombre y apellidos*
          <input id={`${id}-nombre`} name="nombre" autoComplete="name" required maxLength={120} />
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
            <input id={`${id}-telefono`} name="telefono" type="tel" autoComplete="tel" placeholder={prefijo || "Prefijo y número"} required maxLength={30} />
          </div>
        </label>
        <label className={styles.correo} htmlFor={`${id}-correo`}>
          Correo*
          <input id={`${id}-correo`} name="correo" type="email" autoComplete="email" required maxLength={254} />
        </label>
      </div>}

      {agenda && !envioConfirmado && (
        <div className={styles.selectorCita} aria-busy={cargandoHorarios}>
          <div className={styles.calendario}>
            <div className={styles.mes}>
              <button type="button" aria-label="Mes anterior" disabled={esMesInicial || cargandoHorarios} onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}>‹</button>
              <strong aria-live="polite">{tituloMes}</strong>
              <button type="button" aria-label="Mes siguiente" disabled={cargandoHorarios} onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}>›</button>
            </div>
            <div className={styles.dias} role="group" aria-label="Fecha para la llamada">
              {diasSemana.map((dia) => <span key={dia}>{dia}</span>)}
              {Array.from({ length: primerDia }, (_, indice) => <span key={`vacio-${indice}`} aria-hidden="true" />)}
              {Array.from({ length: cantidadDias }, (_, indice) => {
                const dia = new Date(mes.getFullYear(), mes.getMonth(), indice + 1);
                const valor = fechaLocal(dia);
                const tieneHorarios = slots.some((slot) => fechaLocal(new Date(slot)) === valor);
                return (
                  <button
                    key={valor}
                    type="button"
                    disabled={cargandoHorarios || valor < hoy || !tieneHorarios}
                    aria-label={dia.toLocaleDateString("es-ES", { dateStyle: "full" })}
                    aria-pressed={fecha === valor}
                    onClick={() => {
                      const primerSlot = slots.find((slot) => fechaLocal(new Date(slot)) === valor) ?? "";
                      setFecha(valor);
                      setSlotSeleccionado(primerSlot);
                      setMensaje("");
                    }}
                  >
                    {indice + 1}
                  </button>
                );
              })}
            </div>
          </div>
          <fieldset className={styles.horarios} disabled={!fecha || cargandoHorarios}>
            <legend>Horario disponible</legend>
            {cargandoHorarios ? (
              <p className={styles.horariosVacios}>Consultando disponibilidad…</p>
            ) : horariosDelDia.length ? horariosDelDia.map((slot) => (
              <label key={slot}>
                <input type="radio" name="horario" value={slot} checked={slotSeleccionado === slot} onChange={() => setSlotSeleccionado(slot)} />
                <span>{etiquetaHora(slot)}</span>
              </label>
            )) : (
              <p className={styles.horariosVacios}>Selecciona un día disponible.</p>
            )}
          </fieldset>
        </div>
      )}

      {claseGratis && !envioConfirmado && (
        <label className={styles.consentimiento}>
          <input type="checkbox" required name="consentimiento" />
          He leído y acepto los Términos y condiciones y la Política de privacidad.
        </label>
      )}
      {!envioConfirmado && <div className={styles.enviar}>
        {!claseGratis && <p>
          {agenda
            ? slotSeleccionado
              ? `Horario seleccionado: ${fecha.split("-").reverse().join("/")} a las ${etiquetaHora(slotSeleccionado)} (${Intl.DateTimeFormat().resolvedOptions().timeZone || "hora local"}).`
              : "Elige una fecha y un horario disponible para tu llamada."
            : "Tus datos se registrarán de forma segura para que podamos contactarte."}
        </p>}
        <HomeButton type="submit" disabled={enviando || (agenda && cargandoHorarios)} variant={agenda ? "magenta" : "green"} className={styles.enviarBoton}>
          {enviando ? (agenda ? "Confirmando…" : "Enviando…") : agenda ? "Continuar" : claseGratis ? "Apuntarme" : "Solicitar información"}
        </HomeButton>
      </div>}
      <p className={`${styles.estadoFormulario} ${envioConfirmado ? styles.reservaConfirmada : ""}`} role="status">
        {mensaje}
      </p>
    </form>
  );
}
