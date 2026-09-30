type Point = { label: string; value: number; formatted: string };

/** Gráfico SVG de servidor: no hidrata datos ni agrega una librería de gráficos. */
export function BarChart({ title, points, color = "#2563eb" }: { title: string; points: Point[]; color?: string }) {
  const width = 720;
  const height = 180;
  const baseline = 150;
  const max = Math.max(1, ...points.map((point) => point.value));
  const step = 660 / Math.max(1, points.length);
  const labelEvery = Math.max(1, Math.ceil(points.length / 6));
  return <figure className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <figcaption className="mb-4 text-sm font-semibold text-gray-900">{title}</figcaption>
    {points.every((point) => point.value === 0)
      ? <div className="flex h-44 items-center justify-center text-sm text-gray-500">Sin movimientos en este período.</div>
      : <>
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} className="w-full">
          <title>{title}</title>
          <text x="0" y="12" fontSize="10" fill="#6b7280">{points.reduce((top, point) => point.value > top.value ? point : top).formatted}</text>
          <line x1="30" y1={baseline} x2="710" y2={baseline} stroke="#e5e7eb" />
          {points.map((point, index) => {
            const barHeight = point.value / max * 120;
            const x = 36 + index * step;
            return <g key={point.label}>
              <rect x={x} y={baseline - barHeight} width={Math.max(1, step - 3)} height={barHeight} rx="2" fill={color}>
                <title>{point.label}: {point.formatted}</title>
              </rect>
              {index % labelEvery === 0 && <text x={x} y="172" fontSize="10" fill="#6b7280">{point.label}</text>}
            </g>;
          })}
        </svg>
        <details className="mt-2 text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-800">Ver valores</summary>
          <dl className="mt-2 grid max-h-40 grid-cols-2 gap-x-6 gap-y-1 overflow-auto sm:grid-cols-3">
            {points.map((point) => <div key={point.label} className="flex justify-between gap-2"><dt>{point.label}</dt><dd className="font-medium">{point.formatted}</dd></div>)}
          </dl>
        </details>
      </>}
  </figure>;
}
