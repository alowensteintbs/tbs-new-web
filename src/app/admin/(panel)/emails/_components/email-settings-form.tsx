"use client";

import { useActionState } from "react";
import { Field, inputCls } from "@/app/admin/_components/form-field";
import { updateEmailSettings, type EmailFormState } from "../actions";

export function EmailSettingsForm({
  fromEmail,
  fromName,
  hasApiKey,
}: {
  fromEmail: string;
  fromName: string;
  hasApiKey: boolean;
}) {
  const [state, formAction, isPending] = useActionState<EmailFormState, FormData>(
    updateEmailSettings,
    {}
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {!hasApiKey && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Todavía no cargaste la API key de Resend. Sin ella, los emails no se
          envían (las plantillas se guardan igual).
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Email remitente"
          name="fromEmail"
          type="email"
          defaultValue={fromEmail}
          placeholder="no-reply@tudominio.com"
          errors={state.fieldErrors?.fromEmail}
        />
        <Field
          label="Nombre remitente"
          name="fromName"
          defaultValue={fromName}
          placeholder="Traders Business School"
        />
      </div>

      <Field label="Resend API key" name="apiKey">
        <input
          name="apiKey"
          type="password"
          autoComplete="off"
          placeholder={hasApiKey ? "•••••••• (sin cambios)" : "re_…"}
          className={inputCls}
        />
        <p className="mt-1 text-xs text-gray-400">
          Se guarda cifrada. Déjala en blanco para conservar la actual.
        </p>
      </Field>

      {state.ok && (
        <p className="text-sm text-green-600">Configuración guardada.</p>
      )}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {isPending ? "Guardando…" : "Guardar configuración"}
      </button>
    </form>
  );
}
