import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";
import { formatPrice } from "@/lib/currency-resolver";
import { ORDER_STATUS_META } from "../../orders/_lib/status";
import { CustomerForm } from "../_components/customer-form";

export const metadata: Metadata = { title: "Ficha de cliente" };

const dateFmt = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();

  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      surname: true,
      phone: true,
      addressLine: true,
      city: true,
      postalCode: true,
      province: true,
      country: true,
      createdAt: true,
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          number: true,
          total: true,
          status: true,
          createdAt: true,
          currency: { select: { code: true } },
        },
      },
    },
  });
  if (!customer) notFound();

  const fullName = [customer.name, customer.surname].filter(Boolean).join(" ");

  // Total spent, grouped by currency (only paid/fulfilled orders count as
  // revenue). Mixing currencies into one sum would be meaningless.
  const spentByCurrency = new Map<string, number>();
  for (const o of customer.orders) {
    if (o.status === "PAID" || o.status === "FULFILLED") {
      const code = o.currency.code;
      spentByCurrency.set(code, (spentByCurrency.get(code) ?? 0) + Number(o.total));
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/customers" className="text-sm text-gray-500 hover:underline">
          ← Clientes
        </Link>
        <h2 className="mt-1 text-xl font-bold text-gray-900">{fullName}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {customer.email} · Alta {dateFmt.format(customer.createdAt)}
        </p>
      </div>

      {/* Summary tiles */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Pedidos</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {customer.orders.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Total gastado</p>
          {spentByCurrency.size === 0 ? (
            <p className="mt-1 text-2xl font-bold text-gray-900">—</p>
          ) : (
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              {[...spentByCurrency.entries()].map(([code, amount]) => (
                <span key={code} className="text-2xl font-bold text-gray-900">
                  {formatPrice(amount, code)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order history */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Historial de pedidos</h3>
        {customer.orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">Este cliente no tiene pedidos.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Pedido</th>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customer.orders.map((o) => {
                  const meta = ORDER_STATUS_META[o.status];
                  return (
                    <tr key={o.id} className="text-gray-900">
                      <td className="px-5 py-3 font-medium">
                        <Link href={`/admin/orders/${o.id}`} className="text-[#2563EB] hover:underline">
                          {o.number}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{dateFmt.format(o.createdAt)}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-700">
                        {formatPrice(Number(o.total), o.currency.code)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Editable data */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Datos del cliente</h3>
        <CustomerForm
          initialValues={{
            id: customer.id,
            email: customer.email,
            name: customer.name,
            surname: customer.surname,
            phone: customer.phone,
            addressLine: customer.addressLine,
            city: customer.city,
            postalCode: customer.postalCode,
            province: customer.province,
            country: customer.country,
          }}
        />
      </section>
    </div>
  );
}
