export function readPositivePageParam(value: string | null): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export function hasNextPage({
  limit,
  page,
  total
}: {
  limit: number;
  page: number;
  total: number;
}): boolean {
  return page * limit < total;
}
