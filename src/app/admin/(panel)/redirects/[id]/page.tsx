import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { RedirectForm } from "../_components/redirect-form";

export const metadata: Metadata = { title: "Editar redirección" };

export default async function EditRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await db.redirect.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Editar redirección</h2>
        <p className="mt-1 text-sm text-gray-500">{item.from}</p>
      </div>
      <RedirectForm
        initialValues={{
          id: item.id,
          from: item.from,
          to: item.to,
          statusCode: item.statusCode,
          enabled: item.enabled,
        }}
      />
    </div>
  );
}
