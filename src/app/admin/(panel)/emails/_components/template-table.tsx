"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toggleTemplate } from "../actions";

export type TemplateRow = {
  key: string;
  label: string;
  description: string;
  trigger: string;
  enabled: boolean;
};

export function TemplateTable({ templates }: { templates: TemplateRow[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <ul className="divide-y divide-gray-100">
        {templates.map((t) => (
          <li
            key={t.key}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {t.label}
                </span>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  {t.trigger}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {t.description}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => toggleTemplate(t.key, !t.enabled))
                }
                className={`rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
                  t.enabled
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {t.enabled ? "Habilitado" : "Deshabilitado"}
              </button>
              <Link
                href={`/admin/emails/${t.key}`}
                className="text-sm font-medium text-[#2563EB] hover:underline"
              >
                Editar
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
