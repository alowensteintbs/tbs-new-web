import type { Metadata } from "next";
import Link from "next/link";
import Form from "next/form";
import { requireSession } from "@/lib/auth/dal";
import { formatPrice } from "@/lib/currency-resolver";
import { ORDER_STATUSES, ORDER_STATUS_META } from "../orders/_lib/status";
import { getReportMetrics } from "./_lib/metrics";
import { getReportPeriod, periodBuckets, localDate, changePercent, type ReportPeriod } from "./_lib/period";
import { BarChart } from "./_components/bar-chart";

export const metadata: Metadata = { title: "Reportes" };
const number = new Intl.NumberFormat("es-AR");
const percent = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });
const cardClass = "rounded-xl border border-gray-200 bg-white p-5 shadow-sm";
const tableClass = "w-full text-left text-sm [&_th]:whitespace-nowrap [&_th]:px-4 [&_th]:py-3 [&_th]:text-xs [&_th]:font-semibold [&_th]:text-gray-500 [&_td]:px-4 [&_td]:py-3 [&_td]:text-gray-700";

function Comparison({ current, previous }: { current: number; previous: number }) {
  const change = changePercent(current, previous);
  return <span className={`text-xs ${change === null || change === 0 ? "text-gray-500" : change > 0 ? "text-emerald-600" : "text-red-600"}`}>
    {change === null ? "Sin base en el período anterior" : `${change > 0 ? "+" : ""}${percent.format(change)}% frente al período anterior`}
  </span>;
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireSession();
  const params = await searchParams;
  let period: ReportPeriod;
  try { period = getReportPeriod(params); }
  catch (error) {
    return <div className="space-y-4"><h2 className="text-2xl font-bold text-gray-900">Reportes</h2><p role="alert" className="text-sm text-red-600">{error instanceof Error ? error.message : "Período inválido."}</p><Link href="/admin/reportes" className="text-sm text-blue-600 hover:underline">Volver al mes actual</Link></div>;
  }
  const m = await getReportMetrics(period, params.moneda || undefined);
  const totalOrders = m.statuses.reduce((sum, row) => sum + row.count, 0);
  const paidOrders = m.statuses.filter((row) => ["PAID", "FULFILLED", "REFUNDED"].includes(row.status)).reduce((sum, row) => sum + row.count, 0);
  const paidPercent = totalOrders ? paidOrders / totalOrders * 100 : 0;
  const buckets = periodBuckets(period);
  const orderMap = new Map(m.dailyOrders.map((row) => [row.bucket, row.count]));
  const revenueMap = new Map(m.dailyRevenue.map((row) => [`${row.code}:${row.bucket}`, row.revenue]));
  const codes = m.currencies.filter((currency) => !params.moneda || currency.id === params.moneda).map((currency) => currency.code);
  const selectedCodes = codes.filter((code) => m.revenue.some((row) => row.code === code) || params.moneda);
  const chartCodes = selectedCodes.filter((code) => m.dailyRevenue.some((row) => row.code === code));
  const today = localDate(new Date());
  function quickLink(days: number) {
    const from = localDate(new Date(new Date(`${today}T00:00:00-03:00`).getTime() - (days - 1) * 86_400_000));
    const query = new URLSearchParams({ desde: from, hasta: today });
    if (params.moneda) query.set("moneda", params.moneda);
    return `/admin/reportes?${query}`;
  }
  const inputClass = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return <div className="space-y-6 pb-4">
    <div><h2 className="text-2xl font-bold text-gray-900">Reportes</h2><p className="mt-1 text-sm text-gray-500">Ventas y operación de TBS · {period.desde} al {period.hasta}</p></div>
    <div className={cardClass}>
      <Form action="/admin/reportes" scroll={false} key={`${period.desde}:${period.hasta}:${params.moneda ?? ""}`} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Desde<input type="date" name="desde" required defaultValue={period.desde} className={inputClass} /></label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Hasta<input type="date" name="hasta" required defaultValue={period.hasta} className={inputClass} /></label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Moneda<select name="moneda" defaultValue={params.moneda ?? ""} className={inputClass}><option value="">Todas las monedas</option>{m.currencies.map((currency) => <option key={currency.id} value={currency.id}>{currency.code}</option>)}</select></label>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Aplicar</button>
        <div className="flex flex-wrap gap-3 py-2 text-sm text-blue-600"><Link href="/admin/reportes" className="hover:underline">Mes actual</Link><Link href={quickLink(7)} className="hover:underline">Últimos 7 días</Link><Link href={quickLink(30)} className="hover:underline">Últimos 30 días</Link></div>
      </Form>
      <p className="mt-3 text-xs text-gray-500">Hora de Argentina. Hasta 366 días por consulta. Comparación con los {period.days} días inmediatamente anteriores.</p>
    </div>

    <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <section className={cardClass}><h3 className="text-xs font-medium text-gray-500">Ingresos acreditados</h3>
        {selectedCodes.length === 0 ? <p className="mt-2 text-2xl font-bold text-gray-900">—</p> : selectedCodes.map((code) => {
          const row = m.revenue.find((item) => item.code === code);
          return <div key={code} className="mt-2"><p className="text-xl font-bold text-gray-900">{formatPrice(row?.revenue ?? 0, code)}</p><Comparison current={row?.revenue ?? 0} previous={row?.previousRevenue ?? 0} /></div>;
        })}<p className="mt-2 text-xs text-gray-400">Por fecha de cobro; excluye pedidos reembolsados.</p>
      </section>
      <section className={cardClass}><h3 className="text-xs font-medium text-gray-500">Ticket medio</h3>
        {selectedCodes.length === 0 ? <p className="mt-2 text-2xl font-bold text-gray-900">—</p> : selectedCodes.map((code) => {
          const row = m.revenue.find((item) => item.code === code);
          const average = row?.paid ? row.revenue / row.paid : 0;
          const previous = row?.previousPaid ? row.previousRevenue / row.previousPaid : 0;
          return <div key={code} className="mt-2"><p className="text-xl font-bold text-gray-900">{formatPrice(average, code)}</p><Comparison current={average} previous={previous} /></div>;
        })}<p className="mt-2 text-xs text-gray-400">Por pedido acreditado y moneda.</p>
      </section>
      <section className={cardClass}><h3 className="text-xs font-medium text-gray-500">Pedidos creados</h3><p className="mt-2 text-2xl font-bold text-gray-900">{number.format(totalOrders)}</p><p className="mt-2 text-xs text-gray-500">{number.format(paidOrders)} con pago registrado · {percent.format(paidPercent)}%</p><p className="mt-1 text-xs text-gray-400">Incluye reembolsados entre los que registraron pago.</p></section>
      <section className={cardClass}><h3 className="text-xs font-medium text-gray-500">Nuevos clientes</h3><p className="mt-2 text-2xl font-bold text-gray-900">{number.format(m.newCustomers)}</p><p className="mt-2 text-xs text-gray-500">Registrados en el período, en todas las monedas.</p></section>
    </div>

    <div className="grid gap-4 xl:grid-cols-2">
      <BarChart title={`Pedidos creados por ${period.monthly ? "mes" : "día"}`} points={buckets.map((bucket) => ({ label: bucket, value: orderMap.get(bucket) ?? 0, formatted: number.format(orderMap.get(bucket) ?? 0) }))} />
      {chartCodes.map((code) => <BarChart key={code} color="#059669" title={`Ingresos ${code} por ${period.monthly ? "mes" : "día"}`} points={buckets.map((bucket) => { const value = revenueMap.get(`${code}:${bucket}`) ?? 0; return { label: bucket, value, formatted: formatPrice(value, code) }; })} />)}
      {chartCodes.length === 0 && <BarChart title="Evolución de ingresos" points={buckets.map((bucket) => ({ label: bucket, value: 0, formatted: "0" }))} color="#059669" />}
    </div>

    <section className={cardClass}><h3 className="text-sm font-semibold text-gray-900">Pedidos por estado</h3><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{ORDER_STATUSES.map((status) => {
      const count = m.statuses.find((row) => row.status === status)?.count ?? 0;
      const query = new URLSearchParams({ status, desde: period.desde, hasta: period.hasta });
      if (params.moneda) query.set("moneda", params.moneda);
      return <Link key={status} href={`/admin/orders?${query}`} className="rounded-lg border border-gray-200 p-3 hover:border-blue-300"><span className={`rounded-full px-2 py-1 text-xs ${ORDER_STATUS_META[status].badge}`}>{ORDER_STATUS_META[status].label}</span><p className="mt-3 text-xl font-bold text-gray-900">{number.format(count)}</p><p className="mt-1 text-xs text-gray-500">{percent.format(totalOrders ? count / totalOrders * 100 : 0)}%</p></Link>;
    })}</div></section>

    <section className={cardClass}><h3 className="text-sm font-semibold text-gray-900">Ventas por curso</h3><p className="mt-1 text-xs text-gray-500">Pedidos acreditados por fecha de cobro. Importes después de descuentos, distribuidos por el precio de cada curso. Hasta 100 filas, agrupadas por moneda.</p>
      <div className="mt-4 overflow-x-auto"><table className={tableClass}><thead className="border-b border-gray-200 bg-gray-50"><tr><th>Curso</th><th>Moneda</th><th>Pedidos</th><th>Unidades</th><th>Ingresos</th></tr></thead><tbody className="divide-y divide-gray-100">{m.courses.map((row, index) => <tr key={`${row.code}:${row.name}:${index}`}><td className="font-medium">{row.name}</td><td>{row.code}</td><td>{number.format(row.orders)}</td><td>{number.format(row.units)}</td><td className="whitespace-nowrap">{formatPrice(row.revenue, row.code)}</td></tr>)}{m.courses.length === 0 && <tr><td colSpan={5} className="text-center">No hay ventas acreditadas en este período.</td></tr>}</tbody></table></div>
    </section>

    <section className={cardClass}><h3 className="text-sm font-semibold text-gray-900">Pedidos por pasarela</h3><p className="mt-1 text-xs text-gray-500">Pedidos creados en el período y su estado actual. El porcentaje pagado incluye reembolsados; no representa intentos de pago.</p>
      <div className="mt-4 overflow-x-auto"><table className={tableClass}><thead className="border-b border-gray-200 bg-gray-50"><tr><th>Pasarela</th><th>Pedidos</th><th>Con pago registrado</th><th>Pagados / pedidos</th><th>Pendientes</th><th>Fallidos</th></tr></thead><tbody className="divide-y divide-gray-100">{m.gateways.map((row, index) => <tr key={`${row.name}:${index}`}><td className="font-medium">{row.name}</td><td>{number.format(row.total)}</td><td>{number.format(row.paid)}</td><td>{percent.format(row.total ? row.paid / row.total * 100 : 0)}%</td><td>{number.format(row.pending)}</td><td>{number.format(row.failed)}</td></tr>)}{m.gateways.length === 0 && <tr><td colSpan={6} className="text-center">No hay pedidos en este período.</td></tr>}</tbody></table></div>
    </section>
    <p className="text-xs leading-relaxed text-gray-500">Los ingresos y ventas incluyen pedidos ocultos del listado y conservan los cobros. Los pedidos operativos excluyen los ocultos. Los ingresos reflejan pedidos actualmente pagados o completados; no equivalen a un libro contable de movimientos y devoluciones.</p>
  </div>;
}
