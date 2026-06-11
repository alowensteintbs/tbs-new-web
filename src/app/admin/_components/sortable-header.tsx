import Link from "next/link";

export type SortDir = "asc" | "desc";

/**
 * Table header cell that links to the same page with `sort`/`dir` params
 * toggled. The parent Server Component reads these to build Prisma's orderBy.
 */
export function SortableHeader({
  column,
  label,
  currentSort,
  currentDir,
  searchParams,
  className = "",
}: {
  column: string;
  label: string;
  currentSort?: string;
  currentDir?: SortDir;
  searchParams: Record<string, string | undefined>;
  className?: string;
}) {
  const isActive = currentSort === column;
  const nextDir: SortDir = isActive && currentDir === "asc" ? "desc" : "asc";

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "sort" && key !== "dir") params.set(key, value);
  }
  params.set("sort", column);
  params.set("dir", nextDir);

  return (
    <th className={`px-5 py-3 font-medium ${className}`}>
      <Link href={`?${params}`} className="inline-flex items-center gap-1 hover:text-gray-700">
        {label}
        <span className="text-gray-400">
          {isActive ? (currentDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </Link>
    </th>
  );
}
