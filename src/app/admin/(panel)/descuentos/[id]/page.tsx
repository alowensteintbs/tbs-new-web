import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CouponForm, type CouponInitialValues } from "../_components/coupon-form";

export const metadata: Metadata = { title: "Editar cupón" };

/** Format a Date as a `datetime-local` value ("YYYY-MM-DDTHH:mm"), local time. */
function toDatetimeLocal(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const dec = (v: unknown): string => (v == null ? "" : String(v));

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [coupon, currencies, products] = await Promise.all([
    db.coupon.findUnique({
      where: { id },
      include: { products: { select: { productId: true } } },
    }),
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
  if (!coupon) notFound();

  const initialValues: CouponInitialValues = {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    percent: dec(coupon.percent),
    amount: dec(coupon.amount),
    currencyId: coupon.currencyId ?? "",
    minAmount: dec(coupon.minAmount),
    maxUses: coupon.maxUses != null ? String(coupon.maxUses) : "",
    oncePerCustomer: coupon.oncePerCustomer,
    startsAt: toDatetimeLocal(coupon.startsAt),
    endsAt: toDatetimeLocal(coupon.endsAt),
    enabled: coupon.enabled,
    productIds: coupon.products.map((p) => p.productId),
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/descuentos" className="text-sm text-gray-500 hover:underline">
          ← Volver a Descuentos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Cupón {coupon.code}
        </h1>
      </div>
      <CouponForm
        currencies={currencies}
        products={products}
        initialValues={initialValues}
      />
    </div>
  );
}
