"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

/** Dropdown that sets a `status` query param for server-side filtering. */
export function StatusFilter({
  options,
  param = "status",
}: {
  options: { value: string; label: string }[];
  param?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(param, value);
    else params.delete(param);
    startTransition(() => router.replace(`${pathname}?${params}`));
  }

  return (
    <select
      defaultValue={searchParams.get(param) ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
