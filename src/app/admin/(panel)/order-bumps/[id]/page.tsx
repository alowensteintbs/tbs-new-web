import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { OfferForm } from "../_components/offer-form";
import { getOfferOptions } from "../_lib/queries";

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { id } = await params;
  const [offer, options] = await Promise.all([
    db.ofertaCheckout.findUnique({ where: { id }, select: {
      id: true, productoPrincipalId: true, productoOfrecidoId: true, titulo: true, descripcion: true,
      activo: true, posicion: true, prices: { select: { currencyId: true, amount: true } },
    } }), getOfferOptions(),
  ]);
  if (!offer) notFound();
  return <div className="mx-auto max-w-xl space-y-6"><h1 className="text-2xl font-bold">Editar oferta en checkout</h1>
    <OfferForm {...options} initialValues={{ ...offer, prices: Object.fromEntries(offer.prices.map((price) => [price.currencyId, price.amount.toString()])) }} />
  </div>;
}
