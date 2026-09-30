"use client";

export default function ReportsError({ unstable_retry }: { unstable_retry: () => void }) {
  return <div role="alert" className="rounded-xl border border-red-200 bg-white p-6">
    <h2 className="text-lg font-semibold text-gray-900">No se pudieron cargar los reportes</h2>
    <p className="mt-2 text-sm text-gray-500">Intentá nuevamente para consultar las estadísticas.</p>
    <button onClick={() => unstable_retry()} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Reintentar</button>
  </div>;
}
