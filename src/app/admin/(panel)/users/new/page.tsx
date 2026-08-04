import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { UserForm } from "../_components/user-form";

export const metadata: Metadata = { title: "Nuevo usuario" };

export default async function NewUserPage() {
  await requireRole("SUPERADMIN");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Nuevo usuario</h2>
        <p className="mt-1 text-sm text-gray-500">
          Crea un usuario del panel y asígnale un rol.
        </p>
      </div>
      <UserForm />
    </div>
  );
}
