import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth/dal";
import { CustomerForm } from "../_components/customer-form";

export const metadata: Metadata = { title: "Nuevo cliente" };

export default async function NewCustomerPage() {
  await requireSession();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/admin/customers" className="text-sm text-gray-500 hover:underline">
          ← Clientes
        </Link>
        <h2 className="mt-1 text-xl font-bold text-gray-900">Nuevo cliente</h2>
        <p className="mt-1 text-sm text-gray-500">
          Los clientes se crean automáticamente al comprar; añade uno a mano solo
          si lo necesitas.
        </p>
      </div>
      <CustomerForm />
    </div>
  );
}
