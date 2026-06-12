"use client";

import { useActionState } from "react";
import { Field, inputCls } from "@/app/admin/_components/form-field";
import {
  createRedirect,
  updateRedirect,
  type RedirectFormState,
} from "../actions";

type InitialValues = {
  id: string;
  from: string;
  to: string;
  statusCode: number;
  enabled: boolean;
};

export function RedirectForm({ initialValues }: { initialValues?: InitialValues }) {
  const isEditing = !!initialValues;
  const action = isEditing ? updateRedirect : createRedirect;
  const [state, formAction, isPending] = useActionState<RedirectFormState, FormData>(
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
        label="Desde (ruta de origen)"
        name="from"
        defaultValue={initialValues?.from}
        placeholder="/pagina-vieja"
        errors={state.fieldErrors?.from}
        required
      />

      <Field
        label="Hacia (destino)"
        name="to"
        defaultValue={initialValues?.to}
        placeholder="/nueva-pagina o https://..."
        errors={state.fieldErrors?.to}
        required
      />

      <Field label="Tipo" name="statusCode" errors={state.fieldErrors?.statusCode}>
        <select
          name="statusCode"
          defaultValue={initialValues?.statusCode ?? 301}
          className={inputCls}
        >
          <option value={301}>301 — Permanente</option>
          <option value={302}>302 — Temporal</option>
        </select>
      </Field>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          name="enabled"
          type="checkbox"
          defaultChecked={initialValues?.enabled ?? true}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Activa
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {isPending ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear redirección"}
      </button>
    </form>
  );
}
