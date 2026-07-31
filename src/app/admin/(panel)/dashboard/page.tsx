import type { Metadata } from "next";
import Link from "next/link";
import { formatPrice } from "@/lib/currency-resolver";
import { ORDER_STATUS_META } from "../orders/_lib/status";
import { getDashboardMetrics, type CurrencyAmount } from "./_lib/metrics";

export const metadata: Metadata = { title: "Dashboard" };

// Metrics reflect live order/customer data — never serve a cached snapshot.
export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const revenueIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ordersIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const ticketIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const customersIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

/**
 * Render a per-currency money figure. One currency → a single big number;
 * several → the first big with the rest stacked below (we never sum across
 * currencies since there are no exchange rates). Empty → an em dash.
 */
function Money({ amounts }: { amounts: CurrencyAmount[] }) {
  if (amounts.length === 0) {
    return <p className="mt-2 text-2xl font-bold text-gray-900">—</p>;
  }
  const [first, ...rest] = amounts;
  return (
    <div className="mt-2">
      <p className="text-2xl font-bold text-gray-900">
        {formatPrice(first.amount, first.code)}
      </p>
      {rest.map((a) => (
        <p key={a.code} className="text-sm font-semibold text-gray-500">
          {formatPrice(a.amount, a.code)}
        </p>
      ))}
    </div>
  );
}

function StatCard({
  label,
  icon,
  color,
  bg,
  children,
  sub,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          {children}
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${bg} ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const m = await getDashboardMetrics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenido al panel de administración de TBS E-commerce.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ingresos del mes"
          icon={revenueIcon}
          color="text-emerald-600"
          bg="bg-emerald-50"
          sub="Pagos acreditados este mes"
        >
          <Money amounts={m.revenueThisMonth} />
        </StatCard>

        <StatCard
          label="Pedidos del mes"
          icon={ordersIcon}
          color="text-blue-600"
          bg="bg-blue-50"
          sub={`${m.ordersToday} ${m.ordersToday === 1 ? "pedido hoy" : "pedidos hoy"}`}
        >
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {m.ordersThisMonth}
          </p>
        </StatCard>

        <StatCard
          label="Ticket medio"
          icon={ticketIcon}
          color="text-violet-600"
          bg="bg-violet-50"
          sub="Por pedido pagado este mes"
        >
          <Money amounts={m.avgTicketThisMonth} />
        </StatCard>

        <StatCard
          label="Nuevos clientes"
          icon={customersIcon}
          color="text-amber-600"
          bg="bg-amber-50"
          sub="Registrados este mes"
        >
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {m.newCustomersThisMonth}
          </p>
        </StatCard>
      </div>

      {/* Pedidos por estado */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Pedidos por estado
          </h3>
          <span className="text-xs text-gray-400">{m.totalOrders} en total</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {m.statusCounts.map(({ status, count }) => {
            const meta = ORDER_STATUS_META[status];
            return (
              <Link
                key={status}
                href={`/admin/orders?status=${status}`}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:border-gray-300 hover:shadow"
              >
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.badge}`}
                >
                  {meta.label}
                </span>
                <p className="mt-2 text-xl font-bold text-gray-900">{count}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Últimos pedidos */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Últimos pedidos
          </h3>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-[#2563EB] hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {m.recentOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-400">
            Todavía no hay pedidos.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Pedido</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {m.recentOrders.map((o) => {
                  const meta = ORDER_STATUS_META[o.status];
                  return (
                    <tr key={o.id} className="text-gray-900">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-medium text-[#2563EB] hover:underline"
                        >
                          {o.number}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <span className="block font-medium">
                          {o.customerName || "—"}
                        </span>
                        <span className="block text-xs text-gray-400">
                          {o.customerEmail}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {formatPrice(o.total, o.currencyCode)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {dateFmt.format(o.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
