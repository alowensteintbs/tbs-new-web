import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/currency-resolver";
import { CouponTable, type CouponRow } from "./_components/coupon-table";

export const metadata: Metadata = { title: "Descuentos" };

const DATE_FMT = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

function validityLabel(startsAt: Date | null, endsAt: Date | null): string {
  if (startsAt && endsAt)
    return `${DATE_FMT.format(startsAt)} – ${DATE_FMT.format(endsAt)}`;
  if (startsAt) return `Desde ${DATE_FMT.format(startsAt)}`;
  if (endsAt) return `Hasta ${DATE_FMT.format(endsAt)}`;
  return "Siempre";
}

export default async function DescuentosPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      currency: { select: { code: true } },
      _count: { select: { products: true } },
    },
  });

  // Usage per coupon: orders that consumed it (exclude failed/cancelled).
  const usage = coupons.length
    ? await db.order.groupBy({
        by: ["couponId"],
        where: {
          couponId: { in: coupons.map((c) => c.id) },
          status: { in: ["PENDING", "PAID", "FULFILLED", "REFUNDED"] },
        },
        _count: true,
      })
    : [];
  const usedByCoupon = new Map(usage.map((u) => [u.couponId, u._count]));

  const rows: CouponRow[] = coupons.map((c) => {
    const valueLabel =
      c.type === "PERCENTAGE"
        ? `${Number(c.percent)}%${c.currency ? ` · solo ${c.currency.code}` : ""}`
        : `${formatPrice(Number(c.amount), c.currency?.code ?? "EUR")} (fijo)`;
    const used = usedByCoupon.get(c.id) ?? 0;
    return {
      id: c.id,
      code: c.code,
      valueLabel,
      scopeLabel:
        c._count.products > 0
          ? `${c._count.products} producto${c._count.products > 1 ? "s" : ""}`
          : "Global",
      validityLabel: validityLabel(c.startsAt, c.endsAt),
      usageLabel: `${used}${c.maxUses != null ? ` / ${c.maxUses}` : ""}`,
      enabled: c.enabled,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Descuentos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Cupones de descuento que el comprador aplica con un código en el
            checkout.
          </p>
        </div>
        <Link
          href="/admin/descuentos/new"
          className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
        >
          Nuevo cupón
        </Link>
      </div>

      <CouponTable coupons={rows} />
    </div>
  );
}
