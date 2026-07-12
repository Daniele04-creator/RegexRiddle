import { prisma } from "../../core/db/prisma.js";

const MAX_LEADERBOARD_ROWS = 100;

interface LeaderboardRow {
  averageAttempts: number;
  rank: number;
  solvedCount: number;
  username: string;
}

// PostgreSQL window functions keep the ranking rule in the database.
export function listLeaderboardRows(): Promise<LeaderboardRow[]> {
  return prisma.$queryRaw<LeaderboardRow[]>`
    WITH ranked AS (
      SELECT
        u.username AS "username",
        COUNT(*)::int AS "solvedCount",
        AVG(s."attemptsUsed")::float8 AS "averageAttempts",
        ROW_NUMBER() OVER (
          ORDER BY COUNT(*) DESC, AVG(s."attemptsUsed") ASC, u.username ASC
        )::int AS "rank"
      FROM solutions s
      INNER JOIN users u ON u.id = s."userId"
      GROUP BY s."userId", u.username
    )
    SELECT
      "username",
      "solvedCount",
      "averageAttempts",
      "rank"
    FROM ranked
    ORDER BY "rank" ASC
    LIMIT ${MAX_LEADERBOARD_ROWS}
  `;
}
