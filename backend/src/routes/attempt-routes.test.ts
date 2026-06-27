import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  API_AUTH_PATH,
  API_CHALLENGES_PATH,
  type AttemptSubmissionResponseDTO
} from "@regexriddle/shared";

import { buildApp } from "../app.js";
import { prisma } from "../db/prisma.js";
import {
  CSRF_HEADER_NAME,
  CSRF_HEADER_VALUE
} from "../security/csrf-guard.js";

import type { FastifyInstance } from "fastify";
import type { OutgoingHttpHeaders } from "node:http";

const DEMO_CREATOR_ID = "11111111-1111-4111-8111-111111111111";
const DEMO_PLAYER_ID = "22222222-2222-4222-8222-222222222222";
const DEMO_PASSWORD = "Password123!";
const SOLVED_CHALLENGE_ID = "aaaaaaaa-0001-4000-8000-000000000001";
const ATTEMPT_CHALLENGE_ID = "aaaaaaaa-0006-4000-8000-000000000006";
const INCREMENT_CHALLENGE_ID = "aaaaaaaa-0007-4000-8000-000000000007";
const MISSING_CHALLENGE_ID = "00000000-0000-4000-8000-000000000000";
const FORBIDDEN_RESPONSE_KEYS = [
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

function expectNoSensitiveKeys(
  value: unknown,
  forbiddenValue?: string
): void {
  const keys = collectKeys(value);

  for (const forbiddenKey of FORBIDDEN_RESPONSE_KEYS) {
    expect(keys.has(forbiddenKey)).toBe(false);
  }

  if (forbiddenValue !== undefined) {
    expect(JSON.stringify(value)).not.toContain(forbiddenValue);
  }
}

function readSetCookieHeader(response: {
  headers: OutgoingHttpHeaders;
}): string {
  const header = response.headers["set-cookie"];

  if (Array.isArray(header)) {
    expect(header.length).toBeGreaterThan(0);
    return header[0];
  }

  expect(header).toBeTypeOf("string");
  return typeof header === "string" ? header : "";
}

function readCookiePair(setCookie: string): string {
  return setCookie.split(";")[0] ?? "";
}

async function cleanupAttemptTestData(): Promise<void> {
  await prisma.solution.deleteMany({
    where: {
      userId: DEMO_PLAYER_ID,
      challengeId: { in: [ATTEMPT_CHALLENGE_ID, INCREMENT_CHALLENGE_ID] }
    }
  });
  await prisma.attempt.deleteMany({
    where: {
      userId: DEMO_PLAYER_ID,
      challengeId: { in: [ATTEMPT_CHALLENGE_ID, INCREMENT_CHALLENGE_ID] }
    }
  });
}

async function countAttempts(
  userId: string,
  challengeId: string
): Promise<number> {
  return prisma.attempt.count({
    where: {
      userId,
      challengeId
    }
  });
}

describe("attempt submission route", () => {
  let app: FastifyInstance;

  async function loginAs(usernameOrEmail: string): Promise<string> {
    const response = await app.inject({
      method: "POST",
      url: `${API_AUTH_PATH}/login`,
      payload: {
        usernameOrEmail,
        password: DEMO_PASSWORD
      }
    });

    expect(response.statusCode).toBe(200);

    return readCookiePair(readSetCookieHeader(response));
  }

  beforeAll(async () => {
    await cleanupAttemptTestData();
    app = buildApp({ logger: false });
  });

  beforeEach(async () => {
    await cleanupAttemptTestData();
  });

  afterAll(async () => {
    await cleanupAttemptTestData();
    await app.close();
  });

  it("rejects attempt submission without authentication", async () => {
    const response = await app.inject({
      method: "POST",
      url: `${API_CHALLENGES_PATH}/${ATTEMPT_CHALLENGE_ID}/attempts`,
      headers: {
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        pattern: ".*",
        flags: ""
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: "Unauthorized",
      message: "Authentication required."
    });
    expectNoSensitiveKeys(response.json());
  });

  it("rejects authenticated protected mutations without the CSRF header", async () => {
    const cookie = await loginAs("demo_player");
    const response = await app.inject({
      method: "POST",
      url: `${API_CHALLENGES_PATH}/${ATTEMPT_CHALLENGE_ID}/attempts`,
      headers: {
        cookie
      },
      payload: {
        pattern: ".*",
        flags: ""
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: "Forbidden",
      message: "CSRF header is required."
    });
    expectNoSensitiveKeys(response.json());
  });

  it("stores a wrong authenticated attempt and returns aggregate counts only", async () => {
    const cookie = await loginAs("demo_player");
    const response = await app.inject({
      method: "POST",
      url: `${API_CHALLENGES_PATH}/${ATTEMPT_CHALLENGE_ID}/attempts`,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        pattern: ".*",
        flags: ""
      }
    });
    const body = response.json<AttemptSubmissionResponseDTO>();
    const solutionCount = await prisma.solution.count({
      where: {
        userId: DEMO_PLAYER_ID,
        challengeId: ATTEMPT_CHALLENGE_ID
      }
    });

    expect(response.statusCode).toBe(201);
    expect(body.solved).toBe(false);
    expect(body.attempt).toMatchObject({
      challengeId: ATTEMPT_CHALLENGE_ID,
      attemptNumber: 1,
      positiveMatched: 3,
      positiveTotal: 3,
      negativeMatched: 3,
      negativeTotal: 3,
      isCorrect: false
    });
    expect(solutionCount).toBe(0);
    expectNoSensitiveKeys(body, ".*");
  });

  it("stores a correct authenticated attempt and creates a solution", async () => {
    const cookie = await loginAs("demo_player");
    const response = await app.inject({
      method: "POST",
      url: `${API_CHALLENGES_PATH}/${ATTEMPT_CHALLENGE_ID}/attempts`,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        pattern: String.raw`[A-Z]{2}-\d{4}`,
        flags: ""
      }
    });
    const body = response.json<AttemptSubmissionResponseDTO>();
    const solution = await prisma.solution.findUnique({
      where: {
        userId_challengeId: {
          userId: DEMO_PLAYER_ID,
          challengeId: ATTEMPT_CHALLENGE_ID
        }
      },
      select: {
        attemptsUsed: true,
        solvedAt: true
      }
    });

    expect(response.statusCode).toBe(201);
    expect(body.solved).toBe(true);
    expect(body.attempt).toMatchObject({
      challengeId: ATTEMPT_CHALLENGE_ID,
      attemptNumber: 1,
      positiveMatched: 3,
      positiveTotal: 3,
      negativeMatched: 0,
      negativeTotal: 3,
      isCorrect: true
    });
    expect(solution?.attemptsUsed).toBe(1);
    expect(solution?.solvedAt).toBeInstanceOf(Date);
    expectNoSensitiveKeys(body, String.raw`[A-Z]{2}-\d{4}`);
  });

  it("rejects already solved challenges without creating another attempt", async () => {
    const cookie = await loginAs("demo_player");
    const attemptCountBefore = await countAttempts(
      DEMO_PLAYER_ID,
      SOLVED_CHALLENGE_ID
    );
    const response = await app.inject({
      method: "POST",
      url: `${API_CHALLENGES_PATH}/${SOLVED_CHALLENGE_ID}/attempts`,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        pattern: String.raw`\d+`,
        flags: ""
      }
    });
    const attemptCountAfter = await countAttempts(
      DEMO_PLAYER_ID,
      SOLVED_CHALLENGE_ID
    );

    expect(response.statusCode).toBe(409);
    expect(attemptCountAfter).toBe(attemptCountBefore);
    expectNoSensitiveKeys(response.json(), String.raw`\d+`);
  });

  it("rejects authors attempting their own challenges", async () => {
    const cookie = await loginAs("demo_creator");
    const response = await app.inject({
      method: "POST",
      url: `${API_CHALLENGES_PATH}/${SOLVED_CHALLENGE_ID}/attempts`,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        pattern: String.raw`\d+`,
        flags: ""
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: "Forbidden",
      message: "Authors cannot attempt their own challenges."
    });
    expectNoSensitiveKeys(response.json(), String.raw`\d+`);
  });

  it("rejects invalid challenge ids", async () => {
    const cookie = await loginAs("demo_player");
    const response = await app.inject({
      method: "POST",
      url: `${API_CHALLENGES_PATH}/not-a-uuid/attempts`,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        pattern: ".*",
        flags: ""
      }
    });

    expect(response.statusCode).toBe(400);
    expectNoSensitiveKeys(response.json(), ".*");
  });

  it("returns 404 for missing challenges", async () => {
    const cookie = await loginAs("demo_player");
    const response = await app.inject({
      method: "POST",
      url: `${API_CHALLENGES_PATH}/${MISSING_CHALLENGE_ID}/attempts`,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        pattern: ".*",
        flags: ""
      }
    });

    expect(response.statusCode).toBe(404);
    expectNoSensitiveKeys(response.json(), ".*");
  });

  it("rejects invalid regex syntax without creating an attempt", async () => {
    const cookie = await loginAs("demo_player");
    const attemptCountBefore = await countAttempts(
      DEMO_PLAYER_ID,
      ATTEMPT_CHALLENGE_ID
    );
    const response = await app.inject({
      method: "POST",
      url: `${API_CHALLENGES_PATH}/${ATTEMPT_CHALLENGE_ID}/attempts`,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        pattern: "(",
        flags: ""
      }
    });
    const attemptCountAfter = await countAttempts(
      DEMO_PLAYER_ID,
      ATTEMPT_CHALLENGE_ID
    );

    expect(response.statusCode).toBe(422);
    expect(attemptCountAfter).toBe(attemptCountBefore);
    expectNoSensitiveKeys(response.json(), "(");
  });

  it("rejects RE2-incompatible features without creating an attempt", async () => {
    const cookie = await loginAs("demo_player");
    const attemptCountBefore = await countAttempts(
      DEMO_PLAYER_ID,
      ATTEMPT_CHALLENGE_ID
    );
    const response = await app.inject({
      method: "POST",
      url: `${API_CHALLENGES_PATH}/${ATTEMPT_CHALLENGE_ID}/attempts`,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        pattern: String.raw`(cat)\1`,
        flags: ""
      }
    });
    const attemptCountAfter = await countAttempts(
      DEMO_PLAYER_ID,
      ATTEMPT_CHALLENGE_ID
    );

    expect(response.statusCode).toBe(422);
    expect(attemptCountAfter).toBe(attemptCountBefore);
    expectNoSensitiveKeys(response.json(), String.raw`(cat)\1`);
  });

  it("increments attempt numbers for repeated unsolved attempts", async () => {
    const cookie = await loginAs("demo_player");
    const firstResponse = await app.inject({
      method: "POST",
      url: `${API_CHALLENGES_PATH}/${INCREMENT_CHALLENGE_ID}/attempts`,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        pattern: "[A-Z]+",
        flags: ""
      }
    });
    const secondResponse = await app.inject({
      method: "POST",
      url: `${API_CHALLENGES_PATH}/${INCREMENT_CHALLENGE_ID}/attempts`,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        pattern: "[A-Z]{2}",
        flags: ""
      }
    });
    const firstBody = firstResponse.json<AttemptSubmissionResponseDTO>();
    const secondBody = secondResponse.json<AttemptSubmissionResponseDTO>();

    expect(firstResponse.statusCode).toBe(201);
    expect(secondResponse.statusCode).toBe(201);
    expect(firstBody.attempt.attemptNumber).toBe(1);
    expect(secondBody.attempt.attemptNumber).toBe(2);
    expect(firstBody.solved).toBe(false);
    expect(secondBody.solved).toBe(false);
    expectNoSensitiveKeys(firstBody);
    expectNoSensitiveKeys(secondBody);
  });

  it("rejects unknown body keys to prevent mass assignment", async () => {
    const cookie = await loginAs("demo_player");
    const response = await app.inject({
      method: "POST",
      url: `${API_CHALLENGES_PATH}/${ATTEMPT_CHALLENGE_ID}/attempts`,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        pattern: ".*",
        flags: "",
        userId: DEMO_CREATOR_ID
      }
    });

    expect(response.statusCode).toBe(400);
    expectNoSensitiveKeys(response.json(), DEMO_CREATOR_ID);
  });

  it("keeps public challenge endpoints accessible without authentication", async () => {
    const response = await app.inject({
      method: "GET",
      url: API_CHALLENGES_PATH
    });

    expect(response.statusCode).toBe(200);
    expectNoSensitiveKeys(response.json());
  });
});
