import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { TableSearch } from "@/app/admin/_components/table-search";
import { Pagination } from "@/app/admin/_components/pagination";
import { getPagination, getTotalPages } from "@/lib/pagination";
import { RedirectTable } from "./_components/redirect-table";

export const metadata: Metadata = { title: "Redirecciones" };

export default async function RedirectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";

  const where: Prisma.RedirectWhereInput = q
    ? { OR: [{ from: { contains: q } }, { to: { contains: q } }] }
    : {};

  const { page, skip, take } = getPagination(params);

  const [rows, total] = await db.$transaction([
    db.redirect.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: { id: true, from: true, to: true, statusCode: true, enabled: true },
      skip,
      take,
    }),
    db.redirect.count({ where }),
  ]);

  const totalPages = getTotalPages(total);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Redirecciones</h2>
          <p className="mt-1 text-sm text-gray-500">{total} redirección(es)</p>
        </div>
        <Link
          href="/admin/redirects/new"
          className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
        >
          Nueva redirección
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <TableSearch placeholder="Buscar redirección…" />
      </div>

      <RedirectTable rows={rows} />

      <Pagination page={page} totalPages={totalPages} searchParams={params} />
    </div>
  );
}
