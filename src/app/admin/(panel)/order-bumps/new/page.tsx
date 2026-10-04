import { requireRole } from "@/lib/auth/dal";
import { OfferForm } from "../_components/offer-form";
import { getOfferOptions } from "../_lib/queries";

export default async function NewOfferPage() {
  await requireRole("ADMIN", "SUPERADMIN");
  const options = await getOfferOptions();
  return <div className="mx-auto max-w-xl space-y-6"><h1 className="text-2xl font-bold">Nueva oferta en checkout</h1><OfferForm {...options} /></div>;
}
