import type { Metadata } from "next";
import { PageForm } from "../_components/page-form";

export const metadata: Metadata = { title: "Nueva página" };

export default function NuevaPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Nueva página</h2>
        <p className="mt-1 text-sm text-gray-500">
          Introduce los datos de la página y el frame de Figma a maquetar.
        </p>
      </div>
      <PageForm />
    </div>
  );
}
