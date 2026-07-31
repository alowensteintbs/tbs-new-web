"use client";

import { useActionState } from "react";
import { Field, inputCls } from "@/app/admin/_components/form-field";
import type { Role } from "@/generated/prisma/client";
import { ROLE_META, ROLES } from "../_lib/roles";
import { createUser, updateUser, type UserFormState } from "../actions";

type InitialValues = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export function UserForm({ initialValues }: { initialValues?: InitialValues }) {
  const isEditing = !!initialValues;
  const action = isEditing ? updateUser : createUser;
  const [state, formAction, isPending] = useActionState<UserFormState, FormData>(
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
        placeholder="Nombre y apellido"
        errors={state.fieldErrors?.name}
        required
      />

      <Field
        label="Email"
        name="email"
        type="email"
        defaultValue={initialValues?.email}
        placeholder="persona@tbs.com"
        errors={state.fieldErrors?.email}
        required
      />

      <Field label="Rol" name="role" errors={state.fieldErrors?.role}>
        <select
          name="role"
          defaultValue={initialValues?.role ?? "ADMIN"}
          className={inputCls}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_META[r].label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-400">
          {/* Roles are described inline so the picker is self-explanatory. */}
          Superadmin gestiona usuarios; Administrador el catálogo/pedidos/pagos;
          Comercial el día a día.
        </p>
      </Field>

      <Field
        label={isEditing ? "Nueva contraseña" : "Contraseña"}
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder={isEditing ? "Dejar en blanco para no cambiarla" : "Mínimo 8 caracteres"}
        errors={state.fieldErrors?.password}
        required={!isEditing}
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {isPending ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear usuario"}
      </button>
    </form>
  );
}
