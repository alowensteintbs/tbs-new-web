"use client";

import { useActionState } from "react";
import { Field } from "@/app/admin/_components/form-field";
import { updateSettings, type SettingsFormState } from "../actions";

export type SettingsValues = {
  gtm_id: string;
};

export function SettingsForm({ values }: { values: SettingsValues }) {
  const [state, formAction, isPending] = useActionState<
    SettingsFormState,
    FormData
  >(updateSettings, {});

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Google Tag Manager
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Pega el identificador del contenedor. Desde GTM podés administrar
            Analytics, píxeles y las demás etiquetas sin cargar scripts extra.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Field
            label="Google Tag Manager"
            name="gtm_id"
            defaultValue={values.gtm_id}
            placeholder="GTM-XXXXXXX"
            errors={state.fieldErrors?.gtm_id}
          />
          <p className="text-xs text-gray-400">
            Si lo dejás vacío, no se cargará ningún script de analítica o
            marketing desde esta web.
          </p>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
        >
          {isPending ? "Guardando…" : "Guardar ajustes"}
        </button>
        {state.ok && (
          <span className="text-sm text-green-600">Ajustes guardados.</span>
        )}
        {state.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
