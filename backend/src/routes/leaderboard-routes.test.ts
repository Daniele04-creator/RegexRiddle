import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  API_LEADERBOARD_PATH,
  type LeaderboardResponseDTO
} from "@regexriddle/shared";

import { buildApp } from "../app.js";
import { prisma } from "../db/prisma.js";

import type { FastifyInstance } from "fastify";

const TEST_USER_PREFIX = "leaderboard_test_";
const TEST_CHALLENGE_PREFIX = "Leaderboard Test Challenge";
const TEST_PASSWORD_HASH = "leaderboard-test-password-hash";
const FORBIDDEN_RESPONSE_KEYS = [
  "id",
  "email",
  "secretPattern",
  "controls",
  "value",
  "proposedPattern",
  "passwordHash",
  "sessionTokenHash",
  "token",
  "sessionToken"
];

function collectKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectKeys(item, keys);
    }

    return keys;
  }

  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      keys.add(key);
      collectKeys(child, keys);
    }
  }

  return keys;
}

function expectNoSensitiveKeys(value: unknown): void {
  const keys = collectKeys(value);

  for (const forbiddenKey of FORBIDDEN_RESPONSE_KEYS) {
    expect(keys.has(forbiddenKey)).toBe(false);
  }
}

async function cleanupLeaderboardTestData(): Promise<void> {
  const testUsers = await prisma.user.findMany({
    where: { username: { startsWith: TEST_USER_PREFIX } },
    select: { id: true }
  });
  const testUserIds = testUsers.map((user) => user.id);
  const testChallenges = await prisma.challenge.findMany({
    where: {
      OR: [
        { authorId: { in: testUserIds } },
        { title: { startsWith: TEST_CHALLENGE_PREFIX } }
      ]
    },
    select: { id: true }
  });
  const testChallengeIds = testChallenges.map((challenge) => challenge.id);

  await prisma.solution.deleteMany({
    where: {
      OR: [
        { userId: { in: testUserIds } },
        { challengeId: { in: testChallengeIds } }
      ]
    }
  });
  await prisma.attempt.deleteMany({
    where: {
      OR: [
        { userId: { in: testUserIds } },
        { challengeId: { in: testChallengeIds } }
      ]
    }
  });
  await prisma.challenge.deleteMany({
    where: { id: { in: testChallengeIds } }
  });
  await prisma.session.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  await prisma.user.deleteMany({
    where: { id: { in: testUserIds } }
  });
}

async function createLeaderboardUser(suffix: string): Promise<string> {
  const user = await prisma.user.create({
    data: {
      username: `${TEST_USER_PREFIX}${suffix}`,
      email: `${TEST_USER_PREFIX}${suffix}@example.test`,
      passwordHash: TEST_PASSWORD_HASH,
      displayName: `Leaderboard Test ${suffix}`
    },
    select: { id: true }
  });

  return user.id;
}

async function seedLeaderboardTestData(): Promise<void> {
  const authorId = await createLeaderboardUser("author");
  const alphaId = await createLeaderboardUser("alpha");
  const betaId = await createLeaderboardUser("beta");
  const gammaId = await createLeaderboardUser("gamma");
  const deltaId = await createLeaderboardUser("delta");

  await createLeaderboardUser("zero");

  const challenges = await Promise.all(
    [1, 2, 3].map((index) =>
      prisma.challenge.create({
        data: {
          authorId,
          title: `${TEST_CHALLENGE_PREFIX} ${index}`,
          description: "Challenge used only for deterministic leaderboard tests.",
          difficulty: "EASY",
          secretPattern: String.raw`\d+`,
          flags: "",
          publicPositiveExample: "123",
          publicNegativeExample: "abc"
        },
        select: { id: true }
      })
    )
  );

  const [firstChallenge, secondChallenge, thirdChallenge] = challenges;

  await prisma.solution.createMany({
    data: [
      {
        userId: alphaId,
        challengeId: firstChallenge.id,
        attemptsUsed: 1
      },
      {
        userId: alphaId,
        challengeId: secondChallenge.id,
        attemptsUsed: 2
      },
      {
        userId: alphaId,
        challengeId: thirdChallenge.id,
        attemptsUsed: 2
      },
      {
        userId: betaId,
        challengeId: firstChallenge.id,
        attemptsUsed: 1
      },
      {
        userId: betaId,
        challengeId: secondChallenge.id,
        attemptsUsed: 2
      },
      {
        userId: betaId,
        challengeId: thirdChallenge.id,
        attemptsUsed: 2
      },
      {
        userId: gammaId,
        challengeId: firstChallenge.id,
        attemptsUsed: 2
      },
      {
        userId: gammaId,
        challengeId: secondChallenge.id,
        attemptsUsed: 2
      },
      {
        userId: gammaId,
        challengeId: thirdChallenge.id,
        attemptsUsed: 3
      },
      {
        userId: deltaId,
        challengeId: firstChallenge.id,
        attemptsUsed: 1
      },
      {
        userId: deltaId,
        challengeId: secondChallenge.id,
        attemptsUsed: 1
      }
    ]
  });
}

function findLeaderboardItem(
  body: LeaderboardResponseDTO,
  username: string
) {
  return body.items.find((item) => item.user.username === username);
}

describe("public leaderboard route", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    await cleanupLeaderboardTestData();
    await seedLeaderboardTestData();
    app = buildApp({ logger: false });
  });

  afterAll(async () => {
    await cleanupLeaderboardTestData();
    await app.close();
  });

  it("returns a public leaderboard", async () => {
    const response = await app.inject({
      method: "GET",
      url: API_LEADERBOARD_PATH
    });
    const body = response.json<LeaderboardResponseDTO>();

    expect(response.statusCode).toBe(200);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(20);
    expect(body.total).toBeGreaterThanOrEqual(4);
    expect(body.items.length).toBeGreaterThan(0);
    expectNoSensitiveKeys(body);
  });

  it("works without authentication or CSRF because it is public read-only", async () => {
    const response = await app.inject({
      method: "GET",
      url: API_LEADERBOARD_PATH,
      headers: {
        cookie: "rr_session=invalid",
        "x-regexriddle-csrf": "0"
      }
    });

    expect(response.statusCode).toBe(200);
    expectNoSensitiveKeys(response.json());
  });

  it("supports explicit pagination after global ranking", async () => {
    const firstPageResponse = await app.inject({
      method: "GET",
      url: `${API_LEADERBOARD_PATH}?limit=2&page=1`
    });
    const secondPageResponse = await app.inject({
      method: "GET",
      url: `${API_LEADERBOARD_PATH}?limit=2&page=2`
    });
    const firstPage = firstPageResponse.json<LeaderboardResponseDTO>();
    const secondPage = secondPageResponse.json<LeaderboardResponseDTO>();

    expect(firstPageResponse.statusCode).toBe(200);
    expect(secondPageResponse.statusCode).toBe(200);
    expect(firstPage.page).toBe(1);
    expect(firstPage.limit).toBe(2);
    expect(firstPage.items).toHaveLength(2);
    expect(firstPage.items[0]?.rank).toBe(1);
    expect(secondPage.page).toBe(2);
    expect(secondPage.limit).toBe(2);
    expect(secondPage.items[0]?.rank).toBe(3);
  });

  it("rejects invalid page values", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_LEADERBOARD_PATH}?page=0`
    });

    expect(response.statusCode).toBe(400);
    expectNoSensitiveKeys(response.json());
  });

  it("rejects invalid limit values", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_LEADERBOARD_PATH}?limit=51`
    });

    expect(response.statusCode).toBe(400);
    expectNoSensitiveKeys(response.json());
  });

  it("rejects unknown query parameters", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_LEADERBOARD_PATH}?include=users`
    });

    expect(response.statusCode).toBe(400);
    expectNoSensitiveKeys(response.json());
  });

  it("excludes users with zero solved challenges", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_LEADERBOARD_PATH}?limit=50&page=1`
    });
    const body = response.json<LeaderboardResponseDTO>();

    expect(response.statusCode).toBe(200);
    expect(
      findLeaderboardItem(body, `${TEST_USER_PREFIX}zero`)
    ).toBeUndefined();
  });

  it("ranks by solved count descending before average attempts", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_LEADERBOARD_PATH}?limit=50&page=1`
    });
    const body = response.json<LeaderboardResponseDTO>();
    const gamma = findLeaderboardItem(body, `${TEST_USER_PREFIX}gamma`);
    const delta = findLeaderboardItem(body, `${TEST_USER_PREFIX}delta`);

    expect(gamma?.solvedCount).toBe(3);
    expect(delta?.solvedCount).toBe(2);
    expect(gamma?.averageAttempts).toBe(2.33);
    expect(delta?.averageAttempts).toBe(1);
    expect(gamma?.rank).toBeLessThan(delta?.rank ?? 0);
  });

  it("uses lower average attempts as the first tie-breaker", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_LEADERBOARD_PATH}?limit=50&page=1`
    });
    const body = response.json<LeaderboardResponseDTO>();
    const alpha = findLeaderboardItem(body, `${TEST_USER_PREFIX}alpha`);
    const gamma = findLeaderboardItem(body, `${TEST_USER_PREFIX}gamma`);

    expect(alpha?.solvedCount).toBe(gamma?.solvedCount);
    expect(alpha?.averageAttempts).toBe(1.67);
    expect(gamma?.averageAttempts).toBe(2.33);
    expect(alpha?.rank).toBeLessThan(gamma?.rank ?? 0);
  });

  it("uses username ascending as the final tie-breaker", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_LEADERBOARD_PATH}?limit=50&page=1`
    });
    const body = response.json<LeaderboardResponseDTO>();
    const alpha = findLeaderboardItem(body, `${TEST_USER_PREFIX}alpha`);
    const beta = findLeaderboardItem(body, `${TEST_USER_PREFIX}beta`);

    expect(alpha?.solvedCount).toBe(beta?.solvedCount);
    expect(alpha?.averageAttempts).toBe(beta?.averageAttempts);
    expect(alpha?.rank).toBeLessThan(beta?.rank ?? 0);
  });

  it("rounds average attempts to 2 decimals", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_LEADERBOARD_PATH}?limit=50&page=1`
    });
    const body = response.json<LeaderboardResponseDTO>();
    const alpha = findLeaderboardItem(body, `${TEST_USER_PREFIX}alpha`);

    expect(alpha?.totalAttemptsUsed).toBe(5);
    expect(alpha?.solvedCount).toBe(3);
    expect(alpha?.averageAttempts).toBe(1.67);
  });

  it("does not expose sensitive keys or values", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_LEADERBOARD_PATH}?limit=50&page=1`
    });
    const body = response.json<LeaderboardResponseDTO>();

    expect(response.statusCode).toBe(200);
    expectNoSensitiveKeys(body);
    expect(JSON.stringify(body)).not.toContain("@example.test");
    expect(JSON.stringify(body)).not.toContain(TEST_PASSWORD_HASH);
  });
});
