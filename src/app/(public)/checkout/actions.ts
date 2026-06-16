"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdapter } from "@/lib/payments";
import {
  generateOrderNumber,
  readGatewayConfig,
} from "@/lib/payments/checkout";
import type { PayableOrder } from "@/lib/payments/types";

const checkoutSchema = z.object({
  productId: z.string().min(1),
  currencyId: z.string().min(1),
  gatewayId: z.string().min(1, "Elegí un método de pago"),
  email: z.email("Email inválido"),
  name: z.string().trim().min(1, "El nombre es requerido").max(120),
  phone: z.string().trim().max(40).optional(),
  country: z.string().trim().length(2).optional(),
});

export type CheckoutState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
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
    phone: formData.get("phone") || undefined,
    country: (formData.get("country") as string)?.toUpperCase() || undefined,
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
      select: { id: true, provider: true, config: true },
    }),
  ]);

  if (!product || !product.visible) return { error: "El producto no está disponible." };
  const price = product.prices[0];
  if (!price) return { error: "El producto no tiene precio en esta moneda." };
  if (!gateway) return { error: "El método de pago no es válido para esta moneda." };

  const adapter = getAdapter(gateway.provider);
  if (!adapter) return { error: "El método de pago no está disponible." };

  // Reuse a customer by email, or create one.
  const customer = await db.customer.upsert({
    where: { email: input.email },
    update: { name: input.name, phone: input.phone, country: input.country },
    create: {
      email: input.email,
      name: input.name,
      phone: input.phone,
      country: input.country,
    },
    select: { id: true, email: true, name: true },
  });

  const order = await db.order.create({
    data: {
      number: generateOrderNumber(),
      customerId: customer.id,
      currencyId: input.currencyId,
      gatewayId: gateway.id,
      total: price.amount,
      status: "PENDING",
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
    select: {
      id: true,
      number: true,
      total: true,
      status: true,
      currency: { select: { code: true } },
      items: { select: { productName: true, unitPrice: true, quantity: true } },
    },
  });

  const payable: PayableOrder = {
    id: order.id,
    number: order.number,
    total: order.total,
    status: order.status,
    currencyCode: order.currency.code,
    items: order.items,
    customer: { email: customer.email, name: customer.name },
  };

  const start = await adapter.createPayment(payable, readGatewayConfig(gateway.config));

  if (start.paymentRef) {
    await db.order.update({
      where: { id: order.id },
      data: { paymentRef: start.paymentRef },
    });
  }

  // External providers redirect off-site; manual/internal go to our status page.
  if (start.kind === "redirect") redirect(start.url);
  redirect(`/orders/${order.number}`);
}
