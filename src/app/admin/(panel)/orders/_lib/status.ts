import type { OrderStatus } from "@/generated/prisma/client";

/** Display label + badge classes per order status. Shared by list & detail. */
export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; badge: string }
> = {
  PENDING: { label: "Pendiente", badge: "bg-amber-100 text-amber-800" },
  PAID: { label: "Pagado", badge: "bg-green-100 text-green-700" },
  FULFILLED: { label: "Completado", badge: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Cancelado", badge: "bg-gray-100 text-gray-500" },
  REFUNDED: { label: "Reembolsado", badge: "bg-gray-100 text-gray-500" },
  FAILED: { label: "Fallido", badge: "bg-red-100 text-red-700" },
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_META) as OrderStatus[];
