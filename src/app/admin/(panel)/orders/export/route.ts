import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/dal";
import { getOrderWhere, ORDER_TIME_ZONE } from "../_lib/filters";
import { csvRow } from "../_lib/csv";
import { ORDER_STATUS_META } from "../_lib/status";

export async function GET(request: Request) {
  if (!await getSession()) return Response.json({ error: "Sesión requerida." }, { status: 401 });
  const params = Object.fromEntries(new URL(request.url).searchParams);
  let where;
  try { where = getOrderWhere(params); }
  catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Filtros inválidos." }, { status: 400 });
  }
  const dir = params.dir === "asc" ? "asc" : "desc";
  const batchSize = 500;
  const query = {
    where,
    orderBy: [{ createdAt: dir }, { seq: dir }],
    take: batchSize,
    select: {
      id: true, number: true, total: true, status: true, createdAt: true, paidAt: true,
      currency: { select: { code: true } },
      customer: { select: { name: true, surname: true, email: true } },
      gateway: { select: { name: true } },
      items: { select: { productName: true } },
    },
  } satisfies Parameters<typeof db.order.findMany>[0];
  // Verifica la primera consulta antes de comenzar la descarga; luego lee por lotes.
  let batch = await db.order.findMany(query);
  let headerSent = false;
  const encoder = new TextEncoder();
  const dateFmt = new Intl.DateTimeFormat("es-AR", { timeZone: ORDER_TIME_ZONE, dateStyle: "short", timeStyle: "short" });
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        let content = headerSent ? "" : "\uFEFF" + csvRow([
          "Pedido", "Cliente", "Email", "Cursos", "Total", "Moneda", "Estado", "Pasarela",
          "Creado (hora Argentina)", "Pagado (hora Argentina)",
        ]);
        headerSent = true;
        for (const row of batch) {
          content += csvRow([
            row.number, [row.customer.name, row.customer.surname].filter(Boolean).join(" "),
            row.customer.email, row.items.map((item) => item.productName).join(" | "),
            Number(row.total), row.currency.code, ORDER_STATUS_META[row.status].label,
            row.gateway?.name, dateFmt.format(row.createdAt), row.paidAt ? dateFmt.format(row.paidAt) : "",
          ]);
        }
        controller.enqueue(encoder.encode(content));
        if (batch.length < batchSize || request.signal.aborted) { controller.close(); return; }
        const last = batch[batch.length - 1];
        batch = await db.order.findMany({ ...query, cursor: { id: last.id }, skip: 1 });
      } catch (error) { controller.error(error); }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
