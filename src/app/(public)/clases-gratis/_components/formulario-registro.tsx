"use client";

import { useState } from "react";
import type { ClaseGratis } from "./contenido";

export function FormularioRegistro({ clase, ubicacion = "inicio" }: { clase: ClaseGratis; ubicacion?: string }) {
  const id = `registro-${clase.slug}-${ubicacion}`;
  const [prefijo, setPrefijo] = useState("+34");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [mensaje, setMensaje] = useState("");

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const datos = new FormData(event.currentTarget);
    const numero = String(datos.get("telefono") ?? "").replace(/[^\d+]/g, "");
    const telefono = numero.startsWith("+") ? numero : `${prefijo}${numero}`;

    setEnviando(true);
    setMensaje("");
    try {
      const response = await fetch("/api/hubspot/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: clase.slug,
          name: datos.get("nombre"),
          email: datos.get("correo"),
          phone: telefono,
          consent: datos.get("consentimiento") === "on",
          website: datos.get("website"),
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "No pudimos registrar tus datos.");
      }
      setEnviado(true);
      setMensaje("¡Listo! Registramos tus datos correctamente. Revisa tu correo para continuar.");
    } catch (cause) {
      setMensaje(cause instanceof Error ? cause.message : "No pudimos registrar tus datos en este momento.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      className="w-full rounded-[32px] border-2 border-[#0066ff] bg-[#0066ff]/20 p-[22px] backdrop-blur-[2px] [&_input]:focus-visible:outline-2 [&_input]:focus-visible:outline-offset-2 [&_input]:focus-visible:outline-[#3f83ff] [&_select]:focus-visible:outline-2 [&_select]:focus-visible:outline-[#3f83ff]"
      aria-label={`Inscripción a ${clase.nombre}`}
      onSubmit={enviar}
    >
      <input className="absolute -left-[10000px] size-px overflow-hidden" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {!enviado && <div className="space-y-2">
        <label className="block font-space text-xs font-bold tracking-[.03em] text-[#3f83ff]" htmlFor={`${id}-nombre`}>
          Nombre y apellidos*
          <input id={`${id}-nombre`} name="nombre" autoComplete="name" required maxLength={120} className="mt-1 h-11 w-full rounded-lg border border-[#0066ff] bg-[#0066ff]/10 px-4 font-raleway font-normal text-white outline-none" />
        </label>
        <label className="block font-space text-xs font-bold tracking-[.03em] text-[#3f83ff]" htmlFor={`${id}-correo`}>
          Correo*
          <input id={`${id}-correo`} name="correo" type="email" autoComplete="email" required maxLength={254} className="mt-1 h-11 w-full rounded-lg border border-[#0066ff] bg-[#0066ff]/10 px-4 font-raleway font-normal text-white outline-none" />
        </label>
        <label className="block font-space text-xs font-bold tracking-[.03em] text-[#3f83ff]" htmlFor={`${id}-telefono`}>
          Número de teléfono*
          <span className="mt-1 flex h-11 overflow-hidden rounded-lg border border-[#0066ff] bg-[#0066ff]/10">
            <select aria-label="País del teléfono" value={prefijo} onChange={(event) => setPrefijo(event.target.value)} className="w-[118px] border-r border-[#0066ff] bg-transparent px-3 font-raleway font-semibold text-white outline-none">
              <option className="bg-[#121214]" value="+34">España</option>
              <option className="bg-[#121214]" value="+54">Argentina</option>
              <option className="bg-[#121214]" value="+52">México</option>
              <option className="bg-[#121214]" value="+57">Colombia</option>
              <option className="bg-[#121214]" value="+56">Chile</option>
            </select>
            <input id={`${id}-telefono`} name="telefono" type="tel" autoComplete="tel" placeholder={prefijo} required maxLength={30} className="min-w-0 flex-1 bg-transparent px-4 font-raleway font-normal text-white outline-none placeholder:text-white/45" />
          </span>
        </label>
      </div>}

      {!enviado && <label className="my-8 flex items-center gap-2 font-raleway text-xs leading-4 text-white">
        <input type="checkbox" name="consentimiento" required className="size-[18px] shrink-0 appearance-none rounded-[1px] border border-white bg-transparent checked:bg-[#0066ff]" />
        <span>
          He leído y acepto los <a href="/terminos-y-condiciones" className="underline">Términos y condiciones</a> y la <a href="/politica-de-privacidad" className="underline">Política de privacidad</a>*
        </span>
      </label>}

      {!enviado && <button
        type="submit"
        disabled={enviando}
        className="flex h-11 w-full items-center justify-center rounded-full bg-[#0066ff] font-raleway text-lg font-bold text-white"
      >
        {enviando ? "Enviando…" : "Apuntarme ahora"}
      </button>}
      <p className={`font-raleway text-sm leading-5 ${mensaje ? "mt-4" : ""} ${enviado ? "text-[#e1ff3b]" : "text-white"}`} role="status">
        {mensaje}
      </p>
    </form>
  );
}
