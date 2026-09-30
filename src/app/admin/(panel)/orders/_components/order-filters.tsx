import Link from "next/link";
import Form from "next/form";
import { ORDER_STATUS_META, ORDER_STATUSES } from "../_lib/status";
import { ORDER_FILTER_KEYS } from "../_lib/filters";

type Option = { id: string; name: string };
function safeQuery(query: string) {
  const source = new URLSearchParams(query);
  const result = new URLSearchParams();
  for (const key of ORDER_FILTER_KEYS) {
    const value = source.get(key);
    if (value) result.set(key, value);
  }
  return result.toString();
}

export function OrderFilters({ params, courses, currencies, gateways, exportEnabled }: {
  params: Record<string, string | undefined>;
  courses: Option[];
  currencies: Option[];
  gateways: Option[];
  exportEnabled: boolean;
}) {
  const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  function select(label: string, key: string, options: Option[]) {
    return <label className="space-y-1 text-xs font-medium text-gray-600">
      <span>{label}</span>
      <select name={key} defaultValue={params[key] ?? ""} className={inputClass}>
        <option value="">Todos</option>
        {options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
      </select>
    </label>;
  }

  return <div className="shrink-0 space-y-3 rounded-xl border border-gray-200 bg-white p-4">
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Link href="/admin/orders" className={`rounded-lg px-3 py-1.5 ${!params.vista ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>Todos los pedidos</Link>
      <Link href="/admin/orders?vista=transferencias-pendientes" className={`rounded-lg px-3 py-1.5 ${params.vista === "transferencias-pendientes" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>Transferencias pendientes</Link>
      <span className="ml-auto text-xs text-gray-500">Fechas de creación · hora de Argentina</span>
    </div>
    <Form action="/admin/orders" scroll={false} className="space-y-3">
      {params.vista && <input type="hidden" name="vista" value={params.vista} />}
      {params.dir && <input type="hidden" name="dir" value={params.dir} />}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1 text-xs font-medium text-gray-600 sm:col-span-2">
          <span>Buscar pedido o cliente</span>
          <input type="search" name="q" defaultValue={params.q ?? ""} placeholder="Número, email, nombre o apellido…" className={inputClass} />
        </label>
        {([ ["Desde", "desde"], ["Hasta", "hasta"] ] as const).map(([label, key]) => <label key={key} className="space-y-1 text-xs font-medium text-gray-600">
          <span>{label}</span><input type="date" name={key} defaultValue={params[key] ?? ""} className={inputClass} />
        </label>)}
        {select("Estado", "status", ORDER_STATUSES.map((id) => ({ id, name: ORDER_STATUS_META[id].label })))}
        {select("Curso", "curso", courses)}
        {select("Moneda", "moneda", currencies)}
        {select("Pasarela", "pasarela", gateways)}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Aplicar filtros</button>
        <Link href="/admin/orders" className="text-sm text-gray-600 hover:underline">Limpiar</Link>
        {exportEnabled && <a href={`/admin/orders/export?${safeQuery(new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => !!entry[1])).toString())}`} className="ml-auto rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Exportar CSV</a>}
      </div>
    </Form>
  </div>;
}
