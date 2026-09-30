const DAY = 86_400_000;
export const REPORT_TIME_ZONE = "America/Argentina/Buenos_Aires";

export function localDate(date: Date): string {
  return new Date(date.getTime() - 3 * 3_600_000).toISOString().slice(0, 10);
}

function parseDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Indicá fechas válidas.");
  const date = new Date(`${value}T00:00:00-03:00`);
  if (!Number.isFinite(date.getTime()) || localDate(date) !== value) throw new Error("Indicá fechas válidas.");
  return date;
}

export function getReportPeriod(params: Record<string, string | undefined>, now = new Date()) {
  const today = localDate(now);
  const desde = params.desde || `${today.slice(0, 7)}-01`;
  const hasta = params.hasta || today;
  const start = parseDate(desde);
  const end = new Date(parseDate(hasta).getTime() + DAY);
  const days = (end.getTime() - start.getTime()) / DAY;
  if (days <= 0) throw new Error("La fecha desde debe ser anterior o igual a la fecha hasta.");
  if (days > 366) throw new Error("Consultá hasta 366 días por reporte.");
  return { desde, hasta, start, end, days, previousStart: new Date(start.getTime() - days * DAY), monthly: days > 60 };
}

export type ReportPeriod = ReturnType<typeof getReportPeriod>;
export function periodBuckets(period: ReportPeriod) {
  const buckets = new Set<string>();
  for (let offset = 0; offset < period.days; offset++) {
    const day = localDate(new Date(period.start.getTime() + offset * DAY));
    buckets.add(period.monthly ? day.slice(0, 7) : day);
  }
  return [...buckets];
}

export function changePercent(current: number, previous: number): number | null {
  return previous === 0 ? null : (current - previous) / previous * 100;
}
