import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { CouponForm, type CouponInitialValues } from "../_components/coupon-form";

export const metadata: Metadata = { title: "Nuevo cupón" };

const EMPTY: CouponInitialValues = {
  id: "",
  code: "",
  type: "PERCENTAGE",
  percent: "",
  amount: "",
  currencyId: "",
  minAmount: "",
  maxUses: "",
  oncePerCustomer: false,
  startsAt: "",
  endsAt: "",
  enabled: true,
  productIds: [],
};

export default async function NewCouponPage() {
  const [currencies, products] = await Promise.all([
    db.currency.findMany({
      where: { enabled: true },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true },
    }),
    db.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/descuentos" className="text-sm text-gray-500 hover:underline">
          ← Volver a Descuentos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Nuevo cupón</h1>
      </div>
      <CouponForm
        currencies={currencies}
        products={products}
        initialValues={EMPTY}
        mode="create"
      />
    </div>
  );
}
