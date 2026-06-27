import { useQuery } from "@tanstack/react-query";

import { getHealth } from "@/features/health/api";

export const healthQueryKey = ["health"] as const;

export function useHealthQuery() {
  return useQuery({
    queryKey: healthQueryKey,
    queryFn: ({ signal }) => getHealth(signal)
  });
}
