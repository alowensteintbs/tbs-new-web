import type { Prisma } from "@/generated/prisma/client";
import { ORDER_STATUSES } from "./status";

export const ORDER_FILTER_KEYS = ["q", "status", "desde", "hasta", "curso", "moneda", "pasarela", "vista", "dir"] as const;
export const ORDER_TIME_ZONE = "America/Argentina/Buenos_Aires";

function dateBoundary(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("La fecha debe tener formato AAAA-MM-DD.");
  const midnight = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(midnight.getTime()) || midnight.toISOString().slice(0, 10) !== value) {
    throw new Error("La fecha indicada no es válida.");
  }
  // Los días operativos de TBS se interpretan en Argentina (UTC−3).
  return new Date(`${value}T00:00:00-03:00`);
}

export function getOrderWhere(params: Record<string, string | undefined>): Prisma.OrderWhereInput {
  const q = params.q?.trim();
  const status = ORDER_STATUSES.find((value) => value === params.status);
  if (params.status && !status) throw new Error("El estado indicado no es válido.");
  const desde = params.desde ? dateBoundary(params.desde) : undefined;
  const hasta = params.hasta ? dateBoundary(params.hasta) : undefined;
  if (desde && hasta && desde > hasta) throw new Error("La fecha desde debe ser anterior o igual a la fecha hasta.");

  return {
    deletedAt: null,
    ...(q && { OR: [
      { number: { contains: q } },
      { customer: { email: { contains: q } } },
      { customer: { name: { contains: q } } },
      { customer: { surname: { contains: q } } },
    ] }),
    ...(status && { status }),
    ...((desde || hasta) && { createdAt: {
      ...(desde && { gte: desde }),
      ...(hasta && { lt: new Date(hasta.getTime() + 86_400_000) }),
    } }),
    ...(params.curso && { items: { some: { productId: params.curso } } }),
    ...(params.moneda && { currencyId: params.moneda }),
    ...(params.pasarela && { gatewayId: params.pasarela }),
    ...(params.vista === "transferencias-pendientes" && { AND: [
      { status: "PENDING" }, { gateway: { provider: "manual" } },
    ] }),
  };
}
