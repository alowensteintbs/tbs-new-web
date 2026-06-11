"use client";

import { useActionState } from "react";
import { Field, inputCls } from "@/app/admin/_components/form-field";
import {
  createProduct,
  updateProduct,
  type ProductFormState,
} from "../actions";

export type EnabledCurrency = {
  id: string;
  code: string;
  name: string;
  symbol: string;
};

type InitialValues = {
  id: string;
  name: string;
  description: string;
  academyId: string;
  prices: Record<string, string>; // currencyId -> amount
};

export function ProductForm({
  currencies,
  initialValues,
}: {
  currencies: EnabledCurrency[];
  initialValues?: InitialValues;
}) {
  const isEditing = !!initialValues;
  const action = isEditing ? updateProduct : createProduct;
  const [state, formAction, isPending] = useActionState<ProductFormState, FormData>(
    action,
    {}
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {isEditing && <input type="hidden" name="id" value={initialValues.id} />}

      <Field
        label="Nombre"
        name="name"
        defaultValue={initialValues?.name}
        placeholder="Nombre del producto"
        errors={state.fieldErrors?.name}
        required
      />

      <Field
        label="ID academia"
        name="academyId"
        defaultValue={initialValues?.academyId}
        placeholder="Identificador en la academia"
        errors={state.fieldErrors?.academyId}
        required
      />

      <Field label="Descripción" name="description" errors={state.fieldErrors?.description}>
        <textarea
          name="description"
          defaultValue={initialValues?.description}
          placeholder="Descripción del producto"
          rows={4}
          className={inputCls}
        />
      </Field>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-gray-700">Precios</legend>
        {currencies.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay monedas habilitadas. Habilitá al menos una para cargar precios.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {currencies.map((currency) => (
              <div key={currency.id}>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  {currency.name} ({currency.code})
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    {currency.symbol}
                  </span>
                  <input
                    name={`price_${currency.id}`}
                    defaultValue={initialValues?.prices[currency.id] ?? ""}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`${inputCls} pl-8`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </fieldset>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {isPending ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear producto"}
      </button>
    </form>
  );
}
