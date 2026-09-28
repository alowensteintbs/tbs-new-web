import type { WebhookResult } from "./types";

type OrderIdentity = {
  id: string;
  gatewayId: string | null;
  paymentRef: string | null;
  total: { toString(): string };
  currency: { code: string };
};

/** Require authenticated provider payment details to match this order. */
export function matchesVerifiedPayment(order: OrderIdentity, result: WebhookResult): boolean {
  const payment = result.verifiedPayment;
  if (!payment) return true;

  return Boolean(
    result.orderId === order.id &&
    result.paymentRef &&
    order.gatewayId === payment.gatewayId &&
    (!order.paymentRef || order.paymentRef === result.paymentRef) &&
    Number.isFinite(payment.amount) &&
    Number(order.total.toString()) === payment.amount &&
    order.currency.code.toUpperCase() === payment.currency.toUpperCase()
  );
}
