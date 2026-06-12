import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Internal endpoint consumed by proxy.ts to resolve editable redirects.
 * Prisma (with the native MariaDB adapter) can't run inside the proxy bundle,
 * so the proxy fetches the redirect table from here instead. Cached on the
 * proxy side; this handler just returns the current enabled redirects.
 */
export async function GET() {
  const rows = await db.redirect.findMany({
    where: { enabled: true },
    select: { from: true, to: true, statusCode: true },
  });
  return NextResponse.json(rows, {
    headers: { "cache-control": "no-store" },
  });
}
