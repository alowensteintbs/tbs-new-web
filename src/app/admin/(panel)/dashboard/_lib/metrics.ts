import "server-only";
import { db } from "@/lib/db";
import type { OrderStatus } from "@/generated/prisma/client";
import { ORDER_STATUSES } from "../../orders/_lib/status";

/**
 * Dashboard metrics. Computed with grouped aggregate queries (no per-row loops)
 * and run in parallel. Money figures are **grouped by currency**: the schema
 * has no exchange rates, so summing across currencies would be meaningless —
 * revenue and average ticket are reported per currency instead.
 *
 * "Revenue" counts orders whose money actually came in (PAID/FULFILLED) by
 * their `paidAt` date; order/customer counts use `createdAt`.
 */

/** Statuses where the buyer's money has been received (and not refunded). */
const REVENUE_STATUSES: OrderStatus[] = ["PAID", "FULFILLED"];

/** A monetary amount tagged with the currency it's expressed in. */
export type CurrencyAmount = { code: string; amount: number };

export type RecentOrder = {
  id: string;
  number: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currencyCode: string;
  status: OrderStatus;
  createdAt: Date;
};

export type DashboardMetrics = {
  /** Money received so far this month, per currency. */
  revenueThisMonth: CurrencyAmount[];
  /** Average paid-order value this month, per currency. */
  avgTicketThisMonth: CurrencyAmount[];
  ordersThisMonth: number;
  ordersToday: number;
  newCustomersThisMonth: number;
  /** Every status with its order count (zeros included), in canonical order. */
  statusCounts: { status: OrderStatus; count: number }[];
  totalOrders: number;
  recentOrders: RecentOrder[];
};

function startOfMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function startOfToday(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const todayStart = startOfToday(now);

  const [
    currencies,
    revenueByCurrency,
    statusGroups,
    ordersThisMonth,
    ordersToday,
    newCustomersThisMonth,
    recent,
  ] = await Promise.all([
    db.currency.findMany({ select: { id: true, code: true } }),
    db.order.groupBy({
      by: ["currencyId"],
      where: { status: { in: REVENUE_STATUSES }, paidAt: { gte: monthStart } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    db.order.count({ where: { createdAt: { gte: monthStart } } }),
    db.order.count({ where: { createdAt: { gte: todayStart } } }),
    db.customer.count({ where: { createdAt: { gte: monthStart } } }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        number: true,
        total: true,
        status: true,
        createdAt: true,
        customer: { select: { name: true, surname: true, email: true } },
        currency: { select: { code: true } },
      },
    }),
  ]);

  const codeById = new Map(currencies.map((c) => [c.id, c.code]));

  const revenueThisMonth: CurrencyAmount[] = [];
  const avgTicketThisMonth: CurrencyAmount[] = [];
  for (const g of revenueByCurrency) {
    const code = codeById.get(g.currencyId) ?? "EUR";
    const sum = Number(g._sum.total ?? 0);
    const count = g._count._all;
    revenueThisMonth.push({ code, amount: sum });
    avgTicketThisMonth.push({ code, amount: count > 0 ? sum / count : 0 });
  }

  const countByStatus = new Map(
    statusGroups.map((g) => [g.status, g._count._all])
  );
  const statusCounts = ORDER_STATUSES.map((status) => ({
    status,
    count: countByStatus.get(status) ?? 0,
  }));
  const totalOrders = statusCounts.reduce((sum, s) => sum + s.count, 0);

  const recentOrders: RecentOrder[] = recent.map((o) => ({
    id: o.id,
    number: o.number,
    customerName: [o.customer.name, o.customer.surname].filter(Boolean).join(" "),
    customerEmail: o.customer.email,
    total: Number(o.total),
    currencyCode: o.currency.code,
    status: o.status,
    createdAt: o.createdAt,
  }));

  return {
    revenueThisMonth,
    avgTicketThisMonth,
    ordersThisMonth,
    ordersToday,
    newCustomersThisMonth,
    statusCounts,
    totalOrders,
    recentOrders,
  };
}
