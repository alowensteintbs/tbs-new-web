import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

const stats = [
  {
    label: "Pedidos hoy",
    value: "—",
    sub: "Sin datos todavía",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Ingresos del mes",
    value: "—",
    sub: "Sin datos todavía",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Ticket medio",
    value: "—",
    sub: "Sin datos todavía",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    label: "Nuevos leads",
    value: "—",
    sub: "Sin datos todavía",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const modules = [
  { label: "Gestión de pedidos", status: "Próximamente" },
  { label: "Catálogo de productos", status: "Próximamente" },
  { label: "Códigos de descuento", status: "Próximamente" },
  { label: "Links de compra", status: "Próximamente" },
  { label: "Reportes de ventas", status: "Próximamente" },
  { label: "Páginas del sitio", status: "Próximamente" },
  { label: "Usuarios y permisos", status: "Próximamente" },
];

export default function DashboardPage() {
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
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="mt-1 text-xs text-gray-400">{stat.sub}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modules */}
      <div>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Módulos del sistema
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <div
              key={mod.label}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
            >
              <span className="text-sm font-medium text-gray-700">{mod.label}</span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-400">
                {mod.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
