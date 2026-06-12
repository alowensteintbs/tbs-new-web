"use client";

import { useActionState, useRef } from "react";
import { Field, inputCls } from "@/app/admin/_components/form-field";
import {
  createCategory,
  updateCategory,
  type CategoryFormState,
} from "../actions";

type InitialValues = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visible: boolean;
};

export function CategoryForm({ initialValues }: { initialValues?: InitialValues }) {
  const isEditing = !!initialValues;
  const action = isEditing ? updateCategory : createCategory;
  const [state, formAction, isPending] = useActionState<CategoryFormState, FormData>(
    action,
    {}
  );
  const slugRef = useRef<HTMLInputElement>(null);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isEditing) return;
    if (slugRef.current && !slugRef.current.dataset.touched) {
      slugRef.current.value = e.target.value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }
  }

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
        placeholder="Cursos"
        errors={state.fieldErrors?.name}
        onChange={handleNameChange}
        required
      />

      <Field label="Slug" name="slug" errors={state.fieldErrors?.slug}>
        <input
          ref={slugRef}
          name="slug"
          defaultValue={initialValues?.slug}
          placeholder="cursos (se genera del nombre si lo dejás vacío)"
          className={inputCls}
          onInput={() => {
            if (slugRef.current) slugRef.current.dataset.touched = "1";
          }}
        />
      </Field>

      <Field label="Descripción" name="description" errors={state.fieldErrors?.description}>
        <textarea
          name="description"
          defaultValue={initialValues?.description ?? undefined}
          placeholder="Descripción de la categoría"
          rows={3}
          className={inputCls}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          name="visible"
          type="checkbox"
          defaultChecked={initialValues?.visible ?? true}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Visible en el catálogo
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {isPending ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear categoría"}
      </button>
    </form>
  );
}
