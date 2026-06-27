import { useQuery } from "@tanstack/react-query";

import {
  getLeaderboard,
  type LeaderboardPageParams
} from "@/features/leaderboard/api";

export const leaderboardQueryKeys = {
  all: ["leaderboard"] as const,
  list: (params: LeaderboardPageParams) =>
    [...leaderboardQueryKeys.all, "list", params.page, params.limit] as const
};

export function useLeaderboardQuery(params: LeaderboardPageParams) {
  return useQuery({
    queryFn: ({ signal }) => getLeaderboard(params, signal),
    queryKey: leaderboardQueryKeys.list(params)
  });
}
