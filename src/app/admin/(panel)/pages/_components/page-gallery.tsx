"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { deletePage } from "../actions";
import { cn } from "@/lib/utils";

type PageRow = {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: Date;
};

type Props = {
  pages: PageRow[];
  thumbnails: Record<string, string>;
};

const STATUS_META = {
  PUBLISHED: { label: "Publicada", className: "bg-emerald-500 text-white" },
  DRAFT:     { label: "Borrador",  className: "bg-white/90 text-gray-600" },
} satisfies Record<PageRow["status"], { label: string; className: string }>;

function LayoutGridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

export function PageGallery({ pages, thumbnails }: Props) {
  const [, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la página "${name}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      await deletePage(id);
      setDeletingId(null);
    });
  }

  if (pages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50">
          <LayoutGridIcon className="h-7 w-7 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700">Sin páginas todavía</p>
        <p className="mt-1 text-xs text-gray-400">Crea tu primera página para empezar a maquetar.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {pages.map((page) => {
        const thumbnail = thumbnails[page.id];
        const statusMeta = STATUS_META[page.status];
        const isDeleting = deletingId === page.id;

        return (
          <div
            key={page.id}
            className={cn(
              "group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md",
              isDeleting && "opacity-60"
            )}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
              {thumbnail ? (
                <Image
                  src={thumbnail}
                  alt={page.name}
                  fill
                  className="object-cover object-top transition duration-300 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <LayoutGridIcon className="h-10 w-10 text-gray-300" />
                </div>
              )}
              <span className={cn("absolute right-2 top-2 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm", statusMeta.className)}>
                {statusMeta.label}
              </span>
            </div>

            <div className="p-4">
              <p className="truncate font-semibold text-gray-900">{page.name}</p>
              <p className="mt-0.5 truncate font-mono text-xs text-gray-400">/{page.slug}</p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(page.updatedAt).toLocaleDateString("es-AR", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/admin/pages/${page.id}/generate`}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Generar
                </Link>
                <Link
                  href={`/admin/pages/${page.id}`}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(page.id, page.name)}
                  disabled={isDeleting}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  title="Eliminar"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
