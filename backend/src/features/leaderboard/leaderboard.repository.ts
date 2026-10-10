import { databaseSchema, prisma } from "../../core/db/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";

const MAX_LEADERBOARD_ROWS = 100;

// SQL parameters cannot represent identifiers. Quote every identifier and escape quotes.
function qualifiedTable(table: string): Prisma.Sql {
  const quoteIdentifier = (identifier: string): string =>
    `"${identifier.replace(/"/g, '""')}"`;

  return Prisma.raw(`${quoteIdentifier(databaseSchema)}.${quoteIdentifier(table)}`);
}

interface LeaderboardRow {
  averageAttempts: number;
  rank: number;
  solvedCount: number;
  username: string;
}

// PostgreSQL window functions keep the ranking rule in the database.
export function listLeaderboardRows(): Promise<LeaderboardRow[]> {
  return prisma.$queryRaw<LeaderboardRow[]>(Prisma.sql`
    WITH ranked AS (
      SELECT
        u.username AS "username",
        COUNT(*)::int AS "solvedCount",
        AVG(s."attemptsUsed")::float8 AS "averageAttempts",
        ROW_NUMBER() OVER (
          ORDER BY COUNT(*) DESC, AVG(s."attemptsUsed") ASC, u.username ASC
        )::int AS "rank"
      FROM ${qualifiedTable("solutions")} s
      INNER JOIN ${qualifiedTable("users")} u ON u.id = s."userId"
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
  `);
}
