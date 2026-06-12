import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CategoryForm } from "../_components/category-form";

export const metadata: Metadata = { title: "Editar categoría" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await db.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Editar categoría</h2>
        <p className="mt-1 text-sm text-gray-500">/{category.slug}</p>
      </div>
      <CategoryForm
        initialValues={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          visible: category.visible,
        }}
      />
    </div>
  );
}
