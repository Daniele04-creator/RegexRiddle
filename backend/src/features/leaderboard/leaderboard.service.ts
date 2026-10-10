import type {
  LeaderboardItemDTO,
  LeaderboardResponseDTO
} from "@regexriddle/shared";

import { listLeaderboardRows } from "./leaderboard.repository.js";

function roundAverageAttempts(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function getLeaderboard(): Promise<LeaderboardResponseDTO> {
  const rows = await listLeaderboardRows();

  const items: LeaderboardItemDTO[] = rows.map((row) => ({
    rank: row.rank,
    user: {
      username: row.username
    },
    solvedCount: row.solvedCount,
    averageAttempts: roundAverageAttempts(row.averageAttempts)
  }));

  return { items };
}
