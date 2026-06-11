"use client";

import { useActionState } from "react";
import { Field, inputCls } from "@/app/admin/_components/form-field";
import {
  createCurrency,
  updateCurrency,
  type CurrencyFormState,
} from "../actions";

type InitialValues = {
  id: string;
  code: string;
  name: string;
  symbol: string;
  enabled: boolean;
};

export function CurrencyForm({ initialValues }: { initialValues?: InitialValues }) {
  const isEditing = !!initialValues;
  const action = isEditing ? updateCurrency : createCurrency;
  const [state, formAction, isPending] = useActionState<CurrencyFormState, FormData>(
    action,
    {}
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {isEditing && <input type="hidden" name="id" value={initialValues.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código ISO" name="code" errors={state.fieldErrors?.code}>
          <input
            name="code"
            defaultValue={initialValues?.code}
            placeholder="EUR"
            maxLength={3}
            className={`${inputCls} uppercase`}
            required
          />
        </Field>

        <Field
          label="Símbolo"
          name="symbol"
          defaultValue={initialValues?.symbol}
          placeholder="€"
          errors={state.fieldErrors?.symbol}
          required
        />
      </div>

      <Field
        label="Nombre"
        name="name"
        defaultValue={initialValues?.name}
        placeholder="Euro"
        errors={state.fieldErrors?.name}
        required
      />

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          name="enabled"
          type="checkbox"
          defaultChecked={initialValues?.enabled ?? true}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Habilitada (disponible para cargar precios)
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {isPending ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear moneda"}
      </button>
    </form>
  );
}
