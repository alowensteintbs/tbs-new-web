"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/env";
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
  surname: z.string().trim().min(1, "Los apellidos son requeridos").max(120),
  phone: z.string().trim().min(1, "El teléfono es requerido").max(40),
  addressLine: z.string().trim().min(1, "La dirección es requerida").max(200),
  city: z.string().trim().min(1, "La población es requerida").max(120),
  postalCode: z.string().trim().min(1, "El código postal es requerido").max(20),
  province: z.string().trim().min(1, "La provincia es requerida").max(120),
  country: z.string().trim().length(2, "El país es requerido"),
});

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
  if (start.kind === "redirect") redirect(start.url);
  redirect(`/orders/${order.number}`);
}
