import {
  API_LEADERBOARD_PATH,
  type LeaderboardResponseDTO
} from "@regexriddle/shared";

import { apiGet } from "@/lib/api-client";

export interface LeaderboardPageParams {
  limit: number;
  page: number;
}

function createLeaderboardPath({ limit, page }: LeaderboardPageParams): string {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  return `${API_LEADERBOARD_PATH}?${params.toString()}`;
}

export function getLeaderboard(
  params: LeaderboardPageParams,
  signal?: AbortSignal
) {
  return apiGet<LeaderboardResponseDTO>(createLeaderboardPath(params), signal);
}
