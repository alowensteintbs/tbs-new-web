export default function ReportsLoading() {
  return <div role="status" aria-label="Cargando reportes" className="animate-pulse space-y-6">
    <div className="h-8 w-40 rounded bg-gray-200" />
    <div className="h-28 rounded-xl bg-gray-200" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-36 rounded-xl bg-gray-200" />)}</div>
    <div className="grid gap-4 xl:grid-cols-2">{[0, 1].map((item) => <div key={item} className="h-60 rounded-xl bg-gray-200" />)}</div>
    <span className="sr-only">Cargando estadísticas…</span>
  </div>;
}
