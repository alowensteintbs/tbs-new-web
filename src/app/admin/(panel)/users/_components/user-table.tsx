"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  SortableHeader,
  type SortDir,
} from "@/app/admin/_components/sortable-header";
import type { Role } from "@/generated/prisma/client";
import { ROLE_META } from "../_lib/roles";
import { deleteUser } from "../actions";

export type UserRow = {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
};

export function UserTable({
  rows,
  currentUserId,
  sort,
  dir,
  searchParams,
}: {
  rows: UserRow[];
  currentUserId: string;
  sort: string;
  dir: SortDir;
  searchParams: Record<string, string | undefined>;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-500">No se encontraron usuarios.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <SortableHeader column="name" label="Nombre" currentSort={sort} currentDir={dir} searchParams={searchParams} />
            <SortableHeader column="email" label="Email" currentSort={sort} currentDir={dir} searchParams={searchParams} />
            <th className="px-5 py-3 font-medium">Rol</th>
            <SortableHeader column="createdAt" label="Alta" currentSort={sort} currentDir={dir} searchParams={searchParams} />
            <th className="px-5 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <UserRowItem key={row.id} row={row} isSelf={row.id === currentUserId} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRowItem({ row, isSelf }: { row: UserRow; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const meta = ROLE_META[row.role];

  function handleDelete() {
    if (!confirm(`¿Eliminar al usuario "${row.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteUser(row.id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <tr className="text-gray-900">
      <td className="px-5 py-3 font-medium">
        {row.name}
        {isSelf && <span className="ml-2 text-xs font-normal text-gray-400">(vos)</span>}
      </td>
      <td className="px-5 py-3 text-gray-600">{row.email}</td>
      <td className="px-5 py-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}>
          {meta.label}
        </span>
      </td>
      <td className="px-5 py-3 text-gray-500">{row.createdAt}</td>
      <td className="px-5 py-3">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/users/${row.id}`}
              className="text-sm font-medium text-[#2563EB] hover:underline"
            >
              Editar
            </Link>
            {isSelf ? (
              <span
                className="text-sm font-medium text-gray-300"
                title="No podés eliminar tu propio usuario"
              >
                Eliminar
              </span>
            ) : (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
              >
                Eliminar
              </button>
            )}
          </div>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </td>
    </tr>
  );
}
