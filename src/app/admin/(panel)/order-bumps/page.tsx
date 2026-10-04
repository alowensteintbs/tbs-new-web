import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { formatPrice } from "@/lib/currency-resolver";
import { getPagination, getTotalPages } from "@/lib/pagination";
import { Pagination } from "@/app/admin/_components/pagination";
import { disableOffer } from "./actions";

export default async function OffersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireRole("ADMIN", "SUPERADMIN");
  const params = await searchParams;
  const pagination = getPagination(params);
  const [offers, total] = await Promise.all([
    db.ofertaCheckout.findMany({ skip: pagination.skip, take: pagination.take,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      select: { id: true, titulo: true, activo: true, posicion: true,
        productoPrincipal: { select: { name: true } }, productoOfrecido: { select: { name: true } },
        prices: { select: { amount: true, currency: { select: { code: true } } } },
      },
    }), db.ofertaCheckout.count(),
  ]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Order bumps</h1><p className="mt-1 text-sm text-gray-500">Ofertas opcionales para añadir una formación al finalizar la compra.</p></div>
        <Link href="/admin/order-bumps/new" className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white">Nueva oferta</Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500"><tr>{["Oferta", "Productos", "Precios", "Estado", "Acciones"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead>
          <tbody>{offers.map((offer) => <tr key={offer.id} className="border-t border-gray-100">
            <td className="px-4 py-3">{offer.titulo}<span className="block text-xs text-gray-500">Posición {offer.posicion}</span></td>
            <td className="px-4 py-3">{offer.productoPrincipal.name} → {offer.productoOfrecido.name}</td>
            <td className="px-4 py-3">{offer.prices.map((price) => <div key={price.currency.code}>{formatPrice(Number(price.amount), price.currency.code)}</div>)}</td>
            <td className="px-4 py-3">{offer.activo ? "Activa" : "Inactiva"}</td>
            <td className="space-y-2 px-4 py-3"><Link className="text-blue-600" href={`/admin/order-bumps/${offer.id}`}>Editar</Link>
              {offer.activo && <form action={disableOffer}><input type="hidden" name="id" value={offer.id} /><button className="text-red-600">Desactivar</button></form>}
            </td>
          </tr>)}</tbody>
        </table>
        {offers.length === 0 && <p className="p-6 text-sm text-gray-500">No hay ofertas.</p>}
      </div>
      <Pagination page={pagination.page} totalPages={getTotalPages(total)} searchParams={params} />
    </div>
  );
}
