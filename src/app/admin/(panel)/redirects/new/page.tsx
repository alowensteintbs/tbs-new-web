import type { Metadata } from "next";
import { RedirectForm } from "../_components/redirect-form";

export const metadata: Metadata = { title: "Nueva redirección" };

export default function NewRedirectPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Nueva redirección</h2>
        <p className="mt-1 text-sm text-gray-500">
          Redirigí una URL vieja a una nueva (301 permanente o 302 temporal).
        </p>
      </div>
      <RedirectForm />
    </div>
  );
}
