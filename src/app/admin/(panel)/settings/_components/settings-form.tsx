"use client";

import { useActionState } from "react";
import { Field } from "@/app/admin/_components/form-field";
import { updateSettings, type SettingsFormState } from "../actions";

export type SettingsValues = {
  site_name: string;
  gtm_id: string;
  ga_id: string;
  hubspot_id: string;
  facebook_pixel_id: string;
};

export function SettingsForm({ values }: { values: SettingsValues }) {
  const [state, formAction, isPending] = useActionState<
    SettingsFormState,
    FormData
  >(updateSettings, {});

  return (
    <form action={formAction} className="space-y-8">
      {/* General */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            General
          </h2>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Field
            label="Nombre del sitio"
            name="site_name"
            defaultValue={values.site_name}
            placeholder="Traders Business School"
            errors={state.fieldErrors?.site_name}
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Se usa en los datos estructurados (SEO) y como nombre por defecto.
          </p>
        </div>
      </section>

      {/* Analytics & marketing */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Analítica y marketing
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Pega los identificadores de cada herramienta. Deja un campo en blanco
            para desactivar ese script en la tienda.
          </p>
        </div>
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Field
            label="Google Tag Manager"
            name="gtm_id"
            defaultValue={values.gtm_id}
            placeholder="GTM-XXXXXXX"
            errors={state.fieldErrors?.gtm_id}
          />
          <Field
            label="Google Analytics (GA4)"
            name="ga_id"
            defaultValue={values.ga_id}
            placeholder="G-XXXXXXXXXX"
            errors={state.fieldErrors?.ga_id}
          />
          <Field
            label="HubSpot — ID de portal"
            name="hubspot_id"
            defaultValue={values.hubspot_id}
            placeholder="1234567"
            errors={state.fieldErrors?.hubspot_id}
          />
          <Field
            label="Meta Pixel (Facebook) — ID"
            name="facebook_pixel_id"
            defaultValue={values.facebook_pixel_id}
            placeholder="123456789012345"
            errors={state.fieldErrors?.facebook_pixel_id}
          />
          <p className="text-xs text-gray-400">
            Si gestionas GA4 o el píxel <em>dentro</em> de Google Tag Manager, no
            hace falta cargarlos también aquí (los duplicarías).
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
