"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { getSiteUrl } from "@/lib/env";
import { formatPrice } from "@/lib/currency-resolver";
import { validateCoupon, normalizeCode } from "@/lib/coupons";
import { sendOrderStatusEmail } from "@/lib/email/notify";
import { getAdapter } from "@/lib/payments";
import {
  formatOrderNumber,
  readGatewayConfig,
} from "@/lib/payments/checkout";
import type { PayableOrder } from "@/lib/payments/types";

const checkoutSchema = z.object({
  productId: z.string().min(1),
  currencyId: z.string().min(1),
  gatewayId: z.string().min(1, "Elige un método de pago"),
  couponCode: z.string().trim().max(60).optional(),
  email: z.email("Email inválido"),
  name: z.string().trim().min(1, "El nombre es requerido").max(120),
  surname: z.string().trim().min(1, "Los apellidos son requeridos").max(120),
  phone: z.string().trim().min(1, "El teléfono es requerido").max(40),
  addressLine: z.string().trim().min(1, "La dirección es requerida").max(200),
  city: z.string().trim().min(1, "La población es requerida").max(120),
  postalCode: z.string().trim().min(1, "El código postal es requerido").max(20),
  province: z.string().trim().min(1, "La provincia es requerida").max(120),
  country: z.string().trim().length(2, "El país es requerido"),
});

/** Result of the checkout's "apply coupon" preview (see previewCoupon). */
export type CouponPreview =
  | { ok: true; code: string; discountLabel: string; totalLabel: string }
  | { ok: false; error: string };

/**
 * Validate a coupon code against the current product/currency and return the
 * discount to show before the buyer confirms. Authoritative validation runs
 * again in placeOrder — this is only for instant UI feedback.
 */
export async function previewCoupon(formData: FormData): Promise<CouponPreview> {
  const productId = String(formData.get("productId") ?? "");
  const currencyId = String(formData.get("currencyId") ?? "");
  const codeRaw = String(formData.get("couponCode") ?? "");
  if (!codeRaw.trim()) return { ok: false, error: "Introduce un código." };

  const [product, currency] = await Promise.all([
    db.product.findUnique({
      where: { id: productId },
      select: { prices: { where: { currencyId }, select: { amount: true } } },
    }),
    db.currency.findUnique({ where: { id: currencyId }, select: { code: true } }),
  ]);
  const price = product?.prices[0];
  if (!price || !currency) {
    return { ok: false, error: "El producto no está disponible." };
  }

  const subtotal = new Prisma.Decimal(price.amount);
  const res = await validateCoupon({ codeRaw, productId, currencyId, subtotal });
  if (!res.ok) return { ok: false, error: res.error };

  const newTotal = subtotal.minus(res.discount);
  return {
    ok: true,
    code: normalizeCode(codeRaw),
    discountLabel: formatPrice(Number(res.discount), currency.code),
    totalLabel: formatPrice(Number(newTotal), currency.code),
  };
}

export type CheckoutState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  /**
   * Set when the chosen gateway needs an inline payment form (Stripe embedded
   * Checkout). The client mounts Stripe.js with these and never sees any
   * secret key — only the publishable key, which is public by design.
   */
  embedded?: {
    provider: string;
    clientSecret: string;
    publishableKey: string;
    orderNumber: string;
  };
  /**
   * Set when the gateway returns an HTML+JS snippet to embed inline (SeQura's
   * identification form). The client injects it and lets its script drive the
   * flow; the order is confirmed later via the IPN webhook.
   */
  widget?: {
    provider: string;
    html: string;
    orderNumber: string;
  };
};

export async function placeOrder(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse({
    productId: formData.get("productId"),
    currencyId: formData.get("currencyId"),
    gatewayId: formData.get("gatewayId"),
    email: formData.get("email"),
    name: formData.get("name"),
    surname: formData.get("surname"),
    phone: formData.get("phone"),
    addressLine: formData.get("addressLine"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    province: formData.get("province"),
    country: (formData.get("country") as string)?.toUpperCase(),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const input = parsed.data;

  // Re-resolve price server-side from (product, currency). Never trust a client
  // amount. The gateway must be enabled AND accept this currency.
  const [product, gateway] = await Promise.all([
    db.product.findUnique({
      where: { id: input.productId },
      select: {
        id: true,
        name: true,
        sku: true,
        visible: true,
        prices: {
          where: { currencyId: input.currencyId },
          select: { amount: true },
        },
      },
    }),
    db.paymentGateway.findFirst({
      where: {
        id: input.gatewayId,
        enabled: true,
        currencies: { some: { currencyId: input.currencyId } },
      },
      select: { id: true, provider: true, config: true, live: true },
    }),
  ]);

  if (!product || !product.visible) return { error: "El producto no está disponible." };
  const price = product.prices[0];
  if (!price) return { error: "El producto no tiene precio en esta moneda." };
  if (!gateway) return { error: "El método de pago no es válido para esta moneda." };

  const adapter = getAdapter(gateway.provider);
  if (!adapter) return { error: "El método de pago no está disponible." };

  // Coupon (optional). Validated authoritatively here from the code — never
  // trust a client-computed discount. On failure the buyer sees the reason.
  const subtotal = new Prisma.Decimal(price.amount);
  let discount = new Prisma.Decimal(0);
  let couponId: string | null = null;
  let couponCode: string | null = null;
  if (input.couponCode) {
    const res = await validateCoupon({
      codeRaw: input.couponCode,
      productId: product.id,
      currencyId: input.currencyId,
      subtotal,
      customerEmail: input.email,
    });
    if (!res.ok) return { fieldErrors: { couponCode: [res.error] } };
    discount = res.discount;
    couponId = res.coupon.id;
    couponCode = res.coupon.code;
  }
  const total = subtotal.minus(discount);
  const isFree = total.lessThanOrEqualTo(0);

  // Reuse a customer by email, or create one.
  const customerData = {
    name: input.name,
    surname: input.surname,
    phone: input.phone,
    addressLine: input.addressLine,
    city: input.city,
    postalCode: input.postalCode,
    province: input.province,
    country: input.country,
  };
  const customer = await db.customer.upsert({
    where: { email: input.email },
    update: customerData,
    create: { email: input.email, ...customerData },
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
    },
  });

  // The pretty number is derived from the atomic autoincrement `seq`, which only
  // exists after insert. So we create the row (with a throwaway-unique temp
  // number to satisfy the NOT NULL + UNIQUE column), then rewrite `number` from
  // `seq` in the same transaction. Readers never observe the temp value.
  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        number: `tmp-${randomUUID()}`,
        customerId: customer.id,
        currencyId: input.currencyId,
        gatewayId: gateway.id,
        subtotal,
        discountAmount: discount,
        couponId,
        couponCode,
        total,
        status: isFree ? "PAID" : "PENDING",
        paidAt: isFree ? new Date() : null,
        items: {
          create: {
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            unitPrice: price.amount,
            quantity: 1,
          },
        },
      },
      select: { id: true, seq: true },
    });
    return tx.order.update({
      where: { id: created.id },
      data: { number: formatOrderNumber(created.seq) },
      select: {
        id: true,
        number: true,
        total: true,
        status: true,
        currency: { select: { code: true } },
        items: { select: { productName: true, unitPrice: true, quantity: true } },
      },
    });
  });

  // Fully-discounted order (100% / fixed ≥ price): nothing to charge. It was
  // created PAID above — send the receipt and go straight to the status page.
  if (isFree) {
    await sendOrderStatusEmail(order.id, "PAID");
    redirect(`/orders/${order.id}?paid=1`);
  }

  const payable: PayableOrder = {
    id: order.id,
    number: order.number,
    total: order.total,
    status: order.status,
    currencyCode: order.currency.code,
    items: order.items,
    customer: {
      email: customer.email,
      name: customer.name,
      surname: customer.surname,
      phone: customer.phone,
      addressLine: customer.addressLine,
      city: customer.city,
      postalCode: customer.postalCode,
      province: customer.province,
      country: customer.country,
    },
  };

  const config = readGatewayConfig(gateway.config);
  const start = await adapter.createPayment(payable, config, {
    baseUrl: getSiteUrl(),
    gatewayId: gateway.id,
    live: gateway.live,
  });

  if (start.paymentRef) {
    await db.order.update({
      where: { id: order.id },
      data: { paymentRef: start.paymentRef },
    });
  }

  // Embedded providers (Stripe) render their form inline: hand the client the
  // client secret + publishable key so Stripe.js can mount it. No redirect.
  if (start.kind === "embedded") {
    if (!config.publishableKey) {
      return { error: "El método de pago no está configurado correctamente." };
    }
    return {
      embedded: {
        provider: gateway.provider,
        clientSecret: start.clientSecret,
        publishableKey: config.publishableKey,
        orderNumber: order.number,
      },
    };
  }

  // Providers that return an HTML+JS form (SeQura): hand it to the client to
  // embed. The buyer completes it inline; the IPN webhook confirms the order.
  if (start.kind === "html") {
    return {
      widget: {
        provider: gateway.provider,
        html: start.html,
        orderNumber: order.number,
      },
    };
  }

  // External providers redirect off-site; manual/internal go to our status page.
  // The status URL keys off the unguessable `id`, not the sequential number.
  if (start.kind === "redirect") redirect(start.url);
  redirect(`/orders/${order.id}`);
}
