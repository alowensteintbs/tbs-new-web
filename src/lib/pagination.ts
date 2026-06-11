export const DEFAULT_PAGE_SIZE = 20;

export type PaginationParams = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

/** Parses `page` from URL search params into Prisma-ready skip/take. */
export function getPagination(
  params: Record<string, string | undefined>,
  pageSize = DEFAULT_PAGE_SIZE
): PaginationParams {
  const page = Math.max(1, Number(params.page) || 1);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function getTotalPages(totalCount: number, pageSize = DEFAULT_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}
