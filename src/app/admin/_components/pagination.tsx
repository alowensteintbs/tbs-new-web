import Link from "next/link";

/**
 * Server-rendered pagination controls. Builds page links preserving the
 * current search/sort/filter params. Reusable across admin list tables.
 */
export function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(target: number): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
    params.set("page", String(target));
    return `?${params}`;
  }

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <nav className="flex items-center justify-between text-sm" aria-label="Paginación">
      <PageLink href={hrefFor(prev)} disabled={page <= 1}>
        ← Anterior
      </PageLink>

      <span className="text-gray-500">
        Página {page} de {totalPages}
      </span>

      <PageLink href={hrefFor(next)} disabled={page >= totalPages}>
        Siguiente →
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const base = "rounded-lg border px-3 py-2 font-medium transition";
  if (disabled) {
    return (
      <span className={`${base} cursor-not-allowed border-gray-200 text-gray-300`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={`${base} border-gray-300 text-gray-700 hover:bg-gray-50`}>
      {children}
    </Link>
  );
}
