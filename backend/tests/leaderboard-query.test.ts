import assert from "node:assert/strict";
import { test } from "node:test";

test("leaderboard uses the configured schema and quotes SQL identifiers safely", async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL =
    "postgresql://unused:unused@localhost:5432/unused?schema=audit%22schema";

  try {
    const { prisma, databaseSchema } = await import("../src/core/db/prisma.js");
    const { listLeaderboardRows } = await import(
      "../src/features/leaderboard/leaderboard.repository.js"
    );
    const originalQueryRaw = prisma.$queryRaw;
    let capturedQuery: unknown;
    prisma.$queryRaw = (async (query: unknown) => {
      capturedQuery = query;
      return [];
    }) as typeof prisma.$queryRaw;

    try {
      assert.equal(databaseSchema, 'audit"schema');
      assert.deepEqual(await listLeaderboardRows(), []);

      const query = capturedQuery as {
        text: string;
        values: unknown[];
      };

      assert.match(query.text, /FROM "audit""schema"\."solutions" s/);
      assert.match(query.text, /JOIN "audit""schema"\."users" u/);
      assert.deepEqual(query.values, [100]);
    } finally {
      prisma.$queryRaw = originalQueryRaw;
      await prisma.$disconnect();
    }
  } finally {
    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl;
    }
  }
});
