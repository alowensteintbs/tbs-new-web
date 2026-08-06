import "server-only";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

/** Normalize a coupon code for storage and lookup (trim + uppercase). */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

/** Orders that "consume" a coupon (exclude failed/cancelled attempts). */
const CONSUMED_STATES = ["PENDING", "PAID", "FULFILLED", "REFUNDED"] as const;

type CouponWithProducts = Prisma.CouponGetPayload<{
  include: { products: { select: { productId: true } } };
}>;

export type CouponValidation =
  | { ok: true; coupon: CouponWithProducts; discount: Prisma.Decimal }
  | { ok: false; error: string };

/** Discount amount for a coupon on a subtotal, never exceeding the subtotal. */
export function computeDiscount(
  coupon: Pick<CouponWithProducts, "type" | "percent" | "amount">,
  subtotal: Prisma.Decimal
): Prisma.Decimal {
  let discount: Prisma.Decimal;
  if (coupon.type === "PERCENTAGE") {
    const pct = coupon.percent ?? new Prisma.Decimal(0);
    discount = subtotal.mul(pct).div(100).toDecimalPlaces(2);
  } else {
    discount = coupon.amount ?? new Prisma.Decimal(0);
  }
  if (discount.greaterThan(subtotal)) discount = subtotal;
  if (discount.lessThan(0)) discount = new Prisma.Decimal(0);
  return discount;
}

/**
 * Validate a coupon code for a given product/currency/subtotal and (optionally)
 * customer. Returns the discount to apply, or a human-readable error. Authoritative:
 * called both for the checkout preview and inside placeOrder (never trust the client).
 */
export async function validateCoupon(params: {
  codeRaw: string;
  productId: string;
  currencyId: string;
  subtotal: Prisma.Decimal;
  customerEmail?: string;
}): Promise<CouponValidation> {
  const code = normalizeCode(params.codeRaw);
  if (!code) return { ok: false, error: "Introduce un código de cupón." };

  const coupon = await db.coupon.findUnique({
    where: { code },
    include: { products: { select: { productId: true } } },
  });
  if (!coupon || !coupon.enabled) {
    return { ok: false, error: "El cupón no es válido." };
  }

  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) {
    return { ok: false, error: "El cupón todavía no está activo." };
  }
  if (coupon.endsAt && now > coupon.endsAt) {
    return { ok: false, error: "El cupón ha caducado." };
  }

  // Product restriction: rows present → must include this product.
  if (
    coupon.products.length > 0 &&
    !coupon.products.some((p) => p.productId === params.productId)
  ) {
    return { ok: false, error: "El cupón no aplica a este producto." };
  }

  // Currency: FIXED is always currency-bound; PERCENTAGE only if a currency is set.
  if (coupon.type === "FIXED" || coupon.currencyId) {
    if (coupon.currencyId !== params.currencyId) {
      return { ok: false, error: "El cupón no es válido para esta moneda." };
    }
  }

  if (coupon.minAmount && params.subtotal.lessThan(coupon.minAmount)) {
    return {
      ok: false,
      error: "El pedido no alcanza el importe mínimo del cupón.",
    };
  }

  // Usage limits — derived from consuming orders (no counter to drift).
  const consumedWhere = {
    couponId: coupon.id,
    status: { in: [...CONSUMED_STATES] },
  };

  if (coupon.maxUses != null) {
    const used = await db.order.count({ where: consumedWhere });
    if (used >= coupon.maxUses) {
      return { ok: false, error: "El cupón ha alcanzado su límite de usos." };
    }
  }

  if (coupon.oncePerCustomer && params.customerEmail) {
    const prior = await db.order.count({
      where: { ...consumedWhere, customer: { email: params.customerEmail } },
    });
    if (prior > 0) {
      return { ok: false, error: "Ya has usado este cupón." };
    }
  }

  const discount = computeDiscount(coupon, params.subtotal);
  return { ok: true, coupon, discount };
}
