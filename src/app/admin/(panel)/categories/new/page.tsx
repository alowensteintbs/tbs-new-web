import type { Metadata } from "next";
import { CategoryForm } from "../_components/category-form";

export const metadata: Metadata = { title: "Nueva categoría" };

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Nueva categoría</h2>
        <p className="mt-1 text-sm text-gray-500">
          Agrupa productos en categorías para el catálogo.
        </p>
      </div>
      <CategoryForm />
    </div>
  );
}
