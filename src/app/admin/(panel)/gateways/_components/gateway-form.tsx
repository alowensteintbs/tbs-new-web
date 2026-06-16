"use client";

import { useActionState } from "react";
import { Field, inputCls } from "@/app/admin/_components/form-field";
import { getProvider } from "@/lib/payments/providers";
import { updateGateway, type GatewayFormState } from "../actions";

export type CurrencyOption = { id: string; code: string; name: string };

type InitialValues = {
  id: string;
  provider: string;
  name: string;
  enabled: boolean;
  live: boolean;
  currencyIds: string[];
  /** Decrypted config; secret values are NOT sent — fields render blank. */
  config: Record<string, string>;
};

export function GatewayForm({
  currencies,
  initialValues,
}: {
  currencies: CurrencyOption[];
  initialValues: InitialValues;
}) {
  const [state, formAction, isPending] = useActionState<GatewayFormState, FormData>(
    updateGateway,
    {}
  );

  const def = getProvider(initialValues.provider);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="id" value={initialValues.id} />

      {def?.description && (
        <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
          {def.description}
        </p>
      )}

      <Field
        label="Nombre visible"
        name="name"
        defaultValue={initialValues.name}
        placeholder="Tarjeta (Stripe)"
        errors={state.fieldErrors?.name}
        required
      />

      {/* Credential fields — driven by the selected provider's registry entry. */}
      {def && def.fields.length > 0 && (
        <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Credenciales
          </legend>
          {def.fields.map((f) => (
            <Field key={f.key} label={f.label} name={`config.${f.key}`}>
              <input
                name={`config.${f.key}`}
                type={f.secret ? "password" : "text"}
                defaultValue={f.secret ? "" : initialValues.config[f.key] ?? ""}
                placeholder={
                  f.secret && initialValues.config[f.key]
                    ? "•••••••• (sin cambios)"
                    : f.placeholder
                }
                autoComplete="off"
                className={inputCls}
              />
              {f.help && <p className="mt-1 text-xs text-gray-400">{f.help}</p>}
            </Field>
          ))}
        </fieldset>
      )}

      {/* Currencies this gateway serves (drives checkout filtering by money). */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Monedas aceptadas
        </label>
        {currencies.length === 0 ? (
          <p className="text-sm text-gray-400">
            No hay monedas creadas todavía.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {currencies.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  name="currencyIds"
                  value={c.id}
                  defaultChecked={initialValues.currencyIds.includes(c.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">{c.code}</span>
                <span className="text-gray-400">{c.name}</span>
              </label>
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-400">
          El comprador verá esta pasarela solo cuando su moneda esté marcada.
        </p>
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            name="enabled"
            type="checkbox"
            defaultChecked={initialValues.enabled}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Habilitada
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            name="live"
            type="checkbox"
            defaultChecked={initialValues.live}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Modo producción (live)
        </label>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {isPending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
