"use client";

import { useActionState } from "react";
import { Field } from "@/app/admin/_components/form-field";
import {
  createCustomer,
  updateCustomer,
  type CustomerFormState,
} from "../actions";

export type CustomerInitialValues = {
  id: string;
  email: string;
  name: string;
  surname: string | null;
  phone: string | null;
  addressLine: string | null;
  city: string | null;
  postalCode: string | null;
  province: string | null;
  country: string | null;
};

export function CustomerForm({
  initialValues,
}: {
  initialValues?: CustomerInitialValues;
}) {
  const isEditing = !!initialValues;
  const action = isEditing ? updateCustomer : createCustomer;
  const [state, formAction, isPending] = useActionState<
    CustomerFormState,
    FormData
  >(action, {});

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {isEditing && <input type="hidden" name="id" value={initialValues.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Nombre"
          name="name"
          defaultValue={initialValues?.name}
          placeholder="Nombre"
          errors={state.fieldErrors?.name}
          required
        />
        <Field
          label="Apellidos"
          name="surname"
          defaultValue={initialValues?.surname ?? ""}
          placeholder="Apellidos"
          errors={state.fieldErrors?.surname}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Email"
          name="email"
          type="email"
          defaultValue={initialValues?.email}
          placeholder="cliente@email.com"
          errors={state.fieldErrors?.email}
          required
        />
        <Field
          label="Teléfono"
          name="phone"
          defaultValue={initialValues?.phone ?? ""}
          placeholder="+34 600 000 000"
          errors={state.fieldErrors?.phone}
        />
      </div>

      <Field
        label="Dirección"
        name="addressLine"
        defaultValue={initialValues?.addressLine ?? ""}
        placeholder="Calle y número"
        errors={state.fieldErrors?.addressLine}
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label="Ciudad"
          name="city"
          defaultValue={initialValues?.city ?? ""}
          placeholder="Población"
          errors={state.fieldErrors?.city}
        />
        <Field
          label="Código postal"
          name="postalCode"
          defaultValue={initialValues?.postalCode ?? ""}
          placeholder="28001"
          errors={state.fieldErrors?.postalCode}
        />
        <Field
          label="Provincia"
          name="province"
          defaultValue={initialValues?.province ?? ""}
          placeholder="Provincia"
          errors={state.fieldErrors?.province}
        />
      </div>

      <Field label="País" name="country" errors={state.fieldErrors?.country}>
        <input
          name="country"
          defaultValue={initialValues?.country ?? ""}
          placeholder="ES"
          maxLength={2}
          className="w-32 rounded-lg border border-gray-300 px-4 py-3 text-sm uppercase text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">Código ISO de 2 letras (ej. ES).</p>
      </Field>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {isPending ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear cliente"}
      </button>
    </form>
  );
}
