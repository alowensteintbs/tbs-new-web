"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { ROLES } from "./_lib/roles";

const BCRYPT_ROUNDS = 10;

/**
 * User CRUD is restricted to SUPERADMIN (see `requireRole`). Every action
 * re-checks the role server-side — the hidden sidebar link and page guard are
 * UX, not the security boundary.
 */
const userSchema = z.object({
  email: z.email("Email inválido").transform((e) => e.trim().toLowerCase()),
  name: z.string().trim().min(1, "El nombre es requerido").max(120),
  role: z.enum(ROLES as [string, ...string[]]),
  // Optional so edit can leave it blank to keep the current password; the
  // create action enforces presence explicitly.
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(200)
    .optional()
    .or(z.literal("")),
});

export type UserFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseForm(formData: FormData) {
  return userSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    role: formData.get("role"),
    password: formData.get("password") ?? "",
  });
}

export async function createUser(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await requireRole("SUPERADMIN");

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { email, name, role, password } = parsed.data;

  if (!password) {
    return { fieldErrors: { password: ["La contraseña es requerida"] } };
  }

  const exists = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (exists) return { error: `Ya existe un usuario con el email ${email}.` };

  await db.user.create({
    data: {
      email,
      name,
      role: role as never,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const session = await requireRole("SUPERADMIN");

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { error: "Usuario inválido." };

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { email, name, role, password } = parsed.data;

  const target = await db.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!target) return { error: "El usuario no existe." };

  // Email must stay unique across other users.
  const clash = await db.user.findFirst({
    where: { email, NOT: { id } },
    select: { id: true },
  });
  if (clash) return { error: `Ya existe otro usuario con el email ${email}.` };

  // Don't let the last SUPERADMIN be demoted — it would lock everyone out of
  // user management. Blocking self-demotion here also covers the common case.
  if (target.role === "SUPERADMIN" && role !== "SUPERADMIN") {
    const superadmins = await db.user.count({ where: { role: "SUPERADMIN" } });
    if (superadmins <= 1) {
      return {
        error:
          "No se puede cambiar el rol: es el único superadmin. Asigna otro superadmin primero.",
      };
    }
    if (target.id === session.userId) {
      return { error: "No puedes quitarte a ti mismo el rol de superadmin." };
    }
  }

  await db.user.update({
    where: { id },
    data: {
      email,
      name,
      role: role as never,
      // Only touch the password when a new one was actually entered.
      ...(password
        ? { passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) }
        : {}),
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(id: string): Promise<{ error?: string }> {
  const session = await requireRole("SUPERADMIN");

  if (id === session.userId) {
    return { error: "No puedes eliminar tu propio usuario." };
  }

  const target = await db.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!target) return { error: "El usuario no existe." };

  // Never delete the last SUPERADMIN.
  if (target.role === "SUPERADMIN") {
    const superadmins = await db.user.count({ where: { role: "SUPERADMIN" } });
    if (superadmins <= 1) {
      return { error: "No se puede eliminar al único superadmin." };
    }
  }

  await db.user.delete({ where: { id } });
  revalidatePath("/admin/users");
  return {};
}
