import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma, Role } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { TableSearch } from "@/app/admin/_components/table-search";
import { StatusFilter } from "@/app/admin/_components/status-filter";
import type { SortDir } from "@/app/admin/_components/sortable-header";
import { Pagination } from "@/app/admin/_components/pagination";
import { getPagination, getTotalPages } from "@/lib/pagination";
import { ROLE_META, ROLES } from "./_lib/roles";
import { UserTable } from "./_components/user-table";

export const metadata: Metadata = { title: "Usuarios" };

const SORTABLE = { name: "name", email: "email", createdAt: "createdAt" } as const;

const ROLE_OPTIONS = [
  { value: "", label: "Todos los roles" },
  ...ROLES.map((r) => ({ value: r, label: ROLE_META[r].label })),
];

const dateFmt = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  // Only SUPERADMIN manages users. Also gives us the current user id so the
  // table can protect the "delete yourself" case.
  const session = await requireRole("SUPERADMIN");

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const roleParam = params.role && ROLES.includes(params.role as Role) ? (params.role as Role) : undefined;
  const sort = (params.sort && params.sort in SORTABLE ? params.sort : "createdAt") as keyof typeof SORTABLE;
  const dir: SortDir = params.dir === "asc" ? "asc" : "desc";

  const where: Prisma.UserWhereInput = {
    ...(q && { OR: [{ name: { contains: q } }, { email: { contains: q } }] }),
    ...(roleParam && { role: roleParam }),
  };

  const { page, skip, take } = getPagination(params);

  const [rows, total] = await db.$transaction([
    db.user.findMany({
      where,
      orderBy: { [sort]: dir },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      skip,
      take,
    }),
    db.user.count({ where }),
  ]);

  const totalPages = getTotalPages(total);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Usuarios</h2>
          <p className="mt-1 text-sm text-gray-500">{total} usuario(s) del panel</p>
        </div>
        <Link
          href="/admin/users/new"
          className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
        >
          Nuevo usuario
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <TableSearch placeholder="Buscar por nombre o email…" />
        <StatusFilter options={ROLE_OPTIONS} param="role" />
      </div>

      <UserTable
        rows={rows.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          createdAt: dateFmt.format(u.createdAt),
        }))}
        currentUserId={session.userId}
        sort={sort}
        dir={dir}
        searchParams={params}
      />

      <Pagination page={page} totalPages={totalPages} searchParams={params} />
    </div>
  );
}
