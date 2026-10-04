import "server-only";
import { db } from "@/lib/db";
import { Prisma, type OrderStatus } from "@/generated/prisma/client";
import type { ReportPeriod } from "./period";

type Numeric = number | bigint | Prisma.Decimal;
type RevenueRow = { code: string; revenue: Numeric; paid: Numeric; previousRevenue: Numeric; previousPaid: Numeric };
type DailyRow = { bucket: string; code: string; revenue: Numeric };
type CountRow = { bucket: string; count: Numeric };
type CourseRow = { name: string; code: string; revenue: Numeric; orders: Numeric; units: Numeric };
type GatewayRow = { name: string; total: Numeric; paid: Numeric; pending: Numeric; failed: Numeric };

/** SQL parametrizado: agrega en la DB y devuelve solamente series y grupos. */
export async function getReportMetrics(period: ReportPeriod, currencyId?: string) {
  const currency = currencyId ? Prisma.sql`AND o.currencyId = ${currencyId}` : Prisma.empty;
  const created = Prisma.sql`o.createdAt >= ${period.start} AND o.createdAt < ${period.end} AND o.deletedAt IS NULL ${currency}`;
  const paid = Prisma.sql`o.paidAt >= ${period.start} AND o.paidAt < ${period.end} AND o.status IN ('PAID', 'FULFILLED') ${currency}`;
  const bucketFormat = period.monthly ? "%Y-%m" : "%Y-%m-%d";

  const [currencies, revenue, dailyRevenue, dailyOrders, statuses, courses, gateways, newCustomers] = await Promise.all([
    db.currency.findMany({ select: { id: true, code: true }, orderBy: { code: "asc" } }),
    db.$queryRaw<RevenueRow[]>(Prisma.sql`
      SELECT c.code,
        SUM(CASE WHEN o.paidAt >= ${period.start} THEN o.total ELSE 0 END) AS revenue,
        SUM(CASE WHEN o.paidAt >= ${period.start} THEN 1 ELSE 0 END) AS paid,
        SUM(CASE WHEN o.paidAt < ${period.start} THEN o.total ELSE 0 END) AS previousRevenue,
        SUM(CASE WHEN o.paidAt < ${period.start} THEN 1 ELSE 0 END) AS previousPaid
      FROM \`Order\` o JOIN Currency c ON c.id = o.currencyId
      WHERE o.paidAt >= ${period.previousStart} AND o.paidAt < ${period.end}
        AND o.status IN ('PAID', 'FULFILLED') ${currency}
      GROUP BY c.code ORDER BY c.code
    `),
    db.$queryRaw<DailyRow[]>(Prisma.sql`
      SELECT DATE_FORMAT(DATE_SUB(o.paidAt, INTERVAL 3 HOUR), ${bucketFormat}) AS bucket,
        c.code, SUM(o.total) AS revenue
      FROM \`Order\` o JOIN Currency c ON c.id = o.currencyId
      WHERE ${paid} GROUP BY bucket, c.code ORDER BY bucket, c.code
    `),
    db.$queryRaw<CountRow[]>(Prisma.sql`
      SELECT DATE_FORMAT(DATE_SUB(o.createdAt, INTERVAL 3 HOUR), ${bucketFormat}) AS bucket, COUNT(*) AS count
      FROM \`Order\` o WHERE ${created} GROUP BY bucket ORDER BY bucket
    `),
    db.order.groupBy({
      by: ["status"], where: { deletedAt: null, createdAt: { gte: period.start, lt: period.end }, ...(currencyId && { currencyId }) },
      _count: { _all: true },
    }),
    db.$queryRaw<CourseRow[]>(Prisma.sql`
      SELECT i.productName AS name, c.code, COUNT(DISTINCT o.id) AS orders, SUM(i.quantity) AS units,
        SUM(CASE WHEN i.discountAmount IS NOT NULL
          THEN i.unitPrice * i.quantity - i.discountAmount
          ELSE COALESCE(o.total * (i.unitPrice * i.quantity) / NULLIF(
          CASE WHEN o.subtotal > 0 THEN o.subtotal
          ELSE (SELECT SUM(legacy.unitPrice * legacy.quantity) FROM OrderItem legacy WHERE legacy.orderId = o.id) END,
          0), 0) END) AS revenue
      FROM OrderItem i JOIN \`Order\` o ON o.id = i.orderId JOIN Currency c ON c.id = o.currencyId
      WHERE ${paid} GROUP BY i.productId, i.productName, c.code
      ORDER BY c.code, revenue DESC, i.productName LIMIT 100
    `),
    db.$queryRaw<GatewayRow[]>(Prisma.sql`
      SELECT COALESCE(g.name, 'Sin pasarela') AS name, COUNT(*) AS total,
        SUM(CASE WHEN o.status IN ('PAID', 'FULFILLED', 'REFUNDED') THEN 1 ELSE 0 END) AS paid,
        SUM(CASE WHEN o.status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN o.status = 'FAILED' THEN 1 ELSE 0 END) AS failed
      FROM \`Order\` o LEFT JOIN PaymentGateway g ON g.id = o.gatewayId
      WHERE ${created} GROUP BY o.gatewayId, g.name ORDER BY total DESC, name
    `),
    db.customer.count({ where: { createdAt: { gte: period.start, lt: period.end } } }),
  ]);

  return {
    currencies,
    revenue: revenue.map((row) => ({ code: row.code, revenue: Number(row.revenue), paid: Number(row.paid), previousRevenue: Number(row.previousRevenue), previousPaid: Number(row.previousPaid) })),
    dailyRevenue: dailyRevenue.map((row) => ({ ...row, revenue: Number(row.revenue) })),
    dailyOrders: dailyOrders.map((row) => ({ ...row, count: Number(row.count) })),
    statuses: statuses.map((row) => ({ status: row.status as OrderStatus, count: row._count._all })),
    courses: courses.map((row) => ({ ...row, revenue: Number(row.revenue), orders: Number(row.orders), units: Number(row.units) })),
    gateways: gateways.map((row) => ({ ...row, total: Number(row.total), paid: Number(row.paid), pending: Number(row.pending), failed: Number(row.failed) })),
    newCustomers,
  };
}
