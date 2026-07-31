import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { UserForm } from "../_components/user-form";

export const metadata: Metadata = { title: "Editar usuario" };

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("SUPERADMIN");

  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Editar usuario</h2>
      <UserForm
        initialValues={{
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }}
      />
    </div>
  );
}
