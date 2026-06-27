import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  API_AUTH_PATH,
  API_CHALLENGES_PATH,
  type AuthUserResponseDTO,
  type ChallengeCreateRequestDTO,
  type ChallengeDetailDTO,
  type ChallengeListResponseDTO
} from "@regexriddle/shared";

import { buildApp } from "../app.js";
import { prisma } from "../db/prisma.js";
import {
  CSRF_HEADER_NAME,
  CSRF_HEADER_VALUE
} from "../security/csrf-guard.js";

import type { FastifyInstance } from "fastify";
import type { OutgoingHttpHeaders } from "node:http";

const TEST_USER_PREFIX = "cc_test_";
const TEST_TITLE_PREFIX = "Challenge Create Test";
const TEST_PASSWORD = "ChallengeTest123!";
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

function makeRegisterPayload(suffix: string) {
  const usernameSuffix = suffix.slice(0, 24);

  return {
    username: `${TEST_USER_PREFIX}${usernameSuffix}`,
    email: `${TEST_USER_PREFIX}${usernameSuffix}@example.test`,
    password: TEST_PASSWORD,
    displayName: `Challenge Create ${suffix}`
  };
}

function makeValidCreatePayload(
  suffix: string,
  overrides: Partial<ChallengeCreateRequestDTO> = {}
): ChallengeCreateRequestDTO {
  return {
    title: `${TEST_TITLE_PREFIX} ${suffix}`,
    description:
      "Create a regex that matches valid five-digit Italian postal codes.",
    difficulty: "EASY",
    secretPattern: String.raw`\d{5}`,
    flags: "",
    publicPositiveExample: "80125",
    publicNegativeExample: "8012A",
    controls: [
      { kind: "POSITIVE", value: "00100" },
      { kind: "POSITIVE", value: "20121" },
      { kind: "POSITIVE", value: "99999" },
      { kind: "NEGATIVE", value: "1234" },
      { kind: "NEGATIVE", value: "ABCDE" },
      { kind: "NEGATIVE", value: "123456" }
    ],
    ...overrides
  };
}

async function cleanupChallengeCreateTestData(): Promise<void> {
  const testUsers = await prisma.user.findMany({
    where: { username: { startsWith: TEST_USER_PREFIX } },
    select: { id: true }
  });
  const testUserIds = testUsers.map((user) => user.id);
  const testChallenges = await prisma.challenge.findMany({
    where: {
      OR: [
        { authorId: { in: testUserIds } },
        { title: { startsWith: TEST_TITLE_PREFIX } }
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

describe("protected challenge creation route", () => {
  let app: FastifyInstance;

  async function registerAs(
    suffix: string
  ): Promise<{ cookie: string; userId: string; username: string }> {
    const response = await app.inject({
      method: "POST",
      url: `${API_AUTH_PATH}/register`,
      payload: makeRegisterPayload(suffix)
    });
    const body = response.json<AuthUserResponseDTO>();

    expect(response.statusCode).toBe(201);

    return {
      cookie: readCookiePair(readSetCookieHeader(response)),
      userId: body.user.id,
      username: body.user.username
    };
  }

  async function postCreateChallenge(
    cookie: string,
    payload: object,
    csrfHeaderValue = CSRF_HEADER_VALUE
  ) {
    return app.inject({
      method: "POST",
      url: API_CHALLENGES_PATH,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: csrfHeaderValue
      },
      payload
    });
  }

  async function countChallengesByTitle(title: string): Promise<number> {
    return prisma.challenge.count({
      where: { title }
    });
  }

  beforeAll(async () => {
    await cleanupChallengeCreateTestData();
    app = buildApp({ logger: false });
  });

  beforeEach(async () => {
    await cleanupChallengeCreateTestData();
  });

  afterAll(async () => {
    await cleanupChallengeCreateTestData();
    await app.close();
  });

  it("rejects challenge creation without authentication", async () => {
    const response = await app.inject({
      method: "POST",
      url: API_CHALLENGES_PATH,
      headers: {
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: makeValidCreatePayload("unauthenticated")
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: "Unauthorized",
      message: "Authentication required."
    });
    expectNoSensitiveKeys(response.json());
  });

  it("rejects authenticated creation without the CSRF header", async () => {
    const { cookie } = await registerAs("missing_csrf");
    const response = await app.inject({
      method: "POST",
      url: API_CHALLENGES_PATH,
      headers: {
        cookie
      },
      payload: makeValidCreatePayload("missing-csrf")
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: "Forbidden",
      message: "CSRF header is required."
    });
    expectNoSensitiveKeys(response.json());
  });

  it("rejects authenticated creation with the wrong CSRF header", async () => {
    const { cookie } = await registerAs("wrong_csrf");
    const response = await postCreateChallenge(
      cookie,
      makeValidCreatePayload("wrong-csrf"),
      "0"
    );

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: "Forbidden",
      message: "CSRF header is required."
    });
    expectNoSensitiveKeys(response.json());
  });

  it("creates a valid challenge with current user ownership and public DTO", async () => {
    const { cookie, userId, username } = await registerAs("valid_owner");
    const payload = makeValidCreatePayload("valid-owner");
    const response = await postCreateChallenge(cookie, payload);
    const body = response.json<ChallengeDetailDTO>();
    const storedChallenge = await prisma.challenge.findUnique({
      where: { id: body.id },
      select: { authorId: true }
    });

    expect(response.statusCode).toBe(201);
    expect(response.headers.location).toBe(`${API_CHALLENGES_PATH}/${body.id}`);
    expect(body).toMatchObject({
      title: payload.title,
      description: payload.description,
      difficulty: payload.difficulty,
      author: {
        username
      },
      publicPositiveExample: payload.publicPositiveExample,
      publicNegativeExample: payload.publicNegativeExample,
      stats: {
        attemptsTotal: 0,
        solutionsTotal: 0
      }
    });
    expect(body).toHaveProperty("createdAt");
    expect(body).toHaveProperty("updatedAt");
    expect(storedChallenge?.authorId).toBe(userId);
    expectNoSensitiveKeys(body, payload.secretPattern);
  });

  it("rejects body-provided authorId and does not create a challenge", async () => {
    const { cookie } = await registerAs("authorid_reject");
    const title = `${TEST_TITLE_PREFIX} authorId reject`;
    const payload: Record<string, unknown> = {
      ...makeValidCreatePayload("authorId-reject", { title }),
      authorId: "11111111-1111-4111-8111-111111111111"
    };
    const countBefore = await countChallengesByTitle(title);
    const response = await postCreateChallenge(cookie, payload);
    const countAfter = await countChallengesByTitle(title);

    expect(response.statusCode).toBe(400);
    expect(countAfter).toBe(countBefore);
    expectNoSensitiveKeys(response.json(), String(payload.authorId));
  });

  it("rejects unknown body fields", async () => {
    const { cookie } = await registerAs("unknown_reject");
    const payload: Record<string, unknown> = {
      ...makeValidCreatePayload("unknown-reject"),
      secretControls: []
    };
    const response = await postCreateChallenge(cookie, payload);

    expect(response.statusCode).toBe(400);
    expectNoSensitiveKeys(response.json());
  });

  it("rejects invalid difficulty", async () => {
    const { cookie } = await registerAs("invalid_difficulty");
    const payload: Record<string, unknown> = {
      ...makeValidCreatePayload("invalid-difficulty"),
      difficulty: "IMPOSSIBLE"
    };
    const response = await postCreateChallenge(cookie, payload);

    expect(response.statusCode).toBe(400);
    expectNoSensitiveKeys(response.json());
  });

  it("rejects invalid flags with 422 and no challenge persistence", async () => {
    const { cookie } = await registerAs("invalid_flags");
    const title = `${TEST_TITLE_PREFIX} invalid flags`;
    const payload = makeValidCreatePayload("invalid-flags", {
      title,
      flags: "g"
    });
    const countBefore = await countChallengesByTitle(title);
    const response = await postCreateChallenge(cookie, payload);
    const countAfter = await countChallengesByTitle(title);

    expect(response.statusCode).toBe(422);
    expect(countAfter).toBe(countBefore);
    expectNoSensitiveKeys(response.json(), payload.secretPattern);
  });

  it("rejects duplicate flags with 422 and no challenge persistence", async () => {
    const { cookie } = await registerAs("duplicate_flags");
    const title = `${TEST_TITLE_PREFIX} duplicate flags`;
    const payload = makeValidCreatePayload("duplicate-flags", {
      title,
      flags: "ii"
    });
    const countBefore = await countChallengesByTitle(title);
    const response = await postCreateChallenge(cookie, payload);
    const countAfter = await countChallengesByTitle(title);

    expect(response.statusCode).toBe(422);
    expect(countAfter).toBe(countBefore);
    expectNoSensitiveKeys(response.json(), payload.secretPattern);
  });

  it("rejects invalid secret regex with 422 and no challenge persistence", async () => {
    const { cookie } = await registerAs("invalid_regex");
    const title = `${TEST_TITLE_PREFIX} invalid regex`;
    const payload = makeValidCreatePayload("invalid-regex", {
      title,
      secretPattern: "("
    });
    const countBefore = await countChallengesByTitle(title);
    const response = await postCreateChallenge(cookie, payload);
    const countAfter = await countChallengesByTitle(title);

    expect(response.statusCode).toBe(422);
    expect(countAfter).toBe(countBefore);
    expectNoSensitiveKeys(response.json(), payload.secretPattern);
  });

  it("rejects RE2-incompatible secret regex with 422 and no challenge persistence", async () => {
    const { cookie } = await registerAs("re2_incompatible");
    const title = `${TEST_TITLE_PREFIX} re2 incompatible`;
    const payload = makeValidCreatePayload("re2-incompatible", {
      title,
      secretPattern: String.raw`(cat)\1`
    });
    const countBefore = await countChallengesByTitle(title);
    const response = await postCreateChallenge(cookie, payload);
    const countAfter = await countChallengesByTitle(title);

    expect(response.statusCode).toBe(422);
    expect(countAfter).toBe(countBefore);
    expectNoSensitiveKeys(response.json(), payload.secretPattern);
  });

  it("rejects public positive examples that do not match", async () => {
    const { cookie } = await registerAs("positive_example_mismatch");
    const response = await postCreateChallenge(
      cookie,
      makeValidCreatePayload("positive-example-mismatch", {
        publicPositiveExample: "8012A"
      })
    );

    expect(response.statusCode).toBe(422);
    expectNoSensitiveKeys(response.json());
  });

  it("rejects public negative examples that match", async () => {
    const { cookie } = await registerAs("negative_example_match");
    const response = await postCreateChallenge(
      cookie,
      makeValidCreatePayload("negative-example-match", {
        publicNegativeExample: "80125"
      })
    );

    expect(response.statusCode).toBe(422);
    expectNoSensitiveKeys(response.json());
  });

  it("rejects POSITIVE controls that do not match", async () => {
    const { cookie } = await registerAs("positive_control_mismatch");
    const response = await postCreateChallenge(
      cookie,
      makeValidCreatePayload("positive-control-mismatch", {
        controls: [
          { kind: "POSITIVE", value: "00100" },
          { kind: "POSITIVE", value: "ABCDE" },
          { kind: "POSITIVE", value: "99999" },
          { kind: "NEGATIVE", value: "1234" },
          { kind: "NEGATIVE", value: "ZZ999" },
          { kind: "NEGATIVE", value: "123456" }
        ]
      })
    );

    expect(response.statusCode).toBe(422);
    expectNoSensitiveKeys(response.json(), "ABCDE");
  });

  it("rejects NEGATIVE controls that match", async () => {
    const { cookie } = await registerAs("negative_control_match");
    const response = await postCreateChallenge(
      cookie,
      makeValidCreatePayload("negative-control-match", {
        controls: [
          { kind: "POSITIVE", value: "00100" },
          { kind: "POSITIVE", value: "20121" },
          { kind: "POSITIVE", value: "99999" },
          { kind: "NEGATIVE", value: "ABCDE" },
          { kind: "NEGATIVE", value: "1234" },
          { kind: "NEGATIVE", value: "12345" }
        ]
      })
    );

    expect(response.statusCode).toBe(422);
    expectNoSensitiveKeys(response.json(), "12345");
  });

  it("rejects duplicate controls within the same kind", async () => {
    const { cookie } = await registerAs("duplicate_controls");
    const response = await postCreateChallenge(
      cookie,
      makeValidCreatePayload("duplicate-controls", {
        controls: [
          { kind: "POSITIVE", value: "00100" },
          { kind: "POSITIVE", value: "00100" },
          { kind: "POSITIVE", value: "99999" },
          { kind: "NEGATIVE", value: "1234" },
          { kind: "NEGATIVE", value: "ABCDE" },
          { kind: "NEGATIVE", value: "123456" }
        ]
      })
    );

    expect(response.statusCode).toBe(400);
    expectNoSensitiveKeys(response.json(), "00100");
  });

  it("rejects contradictory controls across kinds", async () => {
    const { cookie } = await registerAs("contradictory_controls");
    const response = await postCreateChallenge(
      cookie,
      makeValidCreatePayload("contradictory-controls", {
        controls: [
          { kind: "POSITIVE", value: "00100" },
          { kind: "POSITIVE", value: "20121" },
          { kind: "POSITIVE", value: "99999" },
          { kind: "NEGATIVE", value: "1234" },
          { kind: "NEGATIVE", value: "ABCDE" },
          { kind: "NEGATIVE", value: "00100" }
        ]
      })
    );

    expect(response.statusCode).toBe(400);
    expectNoSensitiveKeys(response.json(), "00100");
  });

  it("rejects too few positive or negative controls", async () => {
    const { cookie } = await registerAs("too_few_controls");
    const response = await postCreateChallenge(
      cookie,
      makeValidCreatePayload("too-few-controls", {
        controls: [
          { kind: "POSITIVE", value: "00100" },
          { kind: "POSITIVE", value: "20121" },
          { kind: "NEGATIVE", value: "1234" },
          { kind: "NEGATIVE", value: "ABCDE" },
          { kind: "NEGATIVE", value: "123456" }
        ]
      })
    );

    expect(response.statusCode).toBe(400);
    expectNoSensitiveKeys(response.json());
  });

  it("persists controls internally after successful creation", async () => {
    const { cookie } = await registerAs("persist_controls");
    const response = await postCreateChallenge(
      cookie,
      makeValidCreatePayload("persist-controls")
    );
    const body = response.json<ChallengeDetailDTO>();
    const controlCount = await prisma.challengeControl.count({
      where: { challengeId: body.id }
    });

    expect(response.statusCode).toBe(201);
    expect(controlCount).toBe(6);
    expectNoSensitiveKeys(body);
  });

  it("keeps successful creation responses free of sensitive fields and values", async () => {
    const { cookie } = await registerAs("success_antileak");
    const payload = makeValidCreatePayload("success-antileak");
    const response = await postCreateChallenge(cookie, payload);
    const body = response.json<ChallengeDetailDTO>();

    expect(response.statusCode).toBe(201);
    expectNoSensitiveKeys(body, payload.secretPattern);
    for (const control of payload.controls) {
      expectNoSensitiveKeys(body, control.value);
    }
  });

  it("keeps public detail and list responses for created challenges free of secrets", async () => {
    const { cookie } = await registerAs("public_antileak");
    const payload = makeValidCreatePayload("public-antileak");
    const createResponse = await postCreateChallenge(cookie, payload);
    const created = createResponse.json<ChallengeDetailDTO>();
    const detailResponse = await app.inject({
      method: "GET",
      url: `${API_CHALLENGES_PATH}/${created.id}`
    });
    const detail = detailResponse.json<ChallengeDetailDTO>();
    const listResponse = await app.inject({
      method: "GET",
      url: `${API_CHALLENGES_PATH}?limit=50&page=1`
    });
    const list = listResponse.json<ChallengeListResponseDTO>();
    const createdListItem = list.items.find((item) => item.id === created.id);

    expect(createResponse.statusCode).toBe(201);
    expect(detailResponse.statusCode).toBe(200);
    expect(listResponse.statusCode).toBe(200);
    expect(detail.id).toBe(created.id);
    expect(createdListItem).toBeDefined();
    expectNoSensitiveKeys(detail, payload.secretPattern);
    expectNoSensitiveKeys(list);
    expectNoSensitiveKeys(createdListItem, payload.secretPattern);
    for (const control of payload.controls) {
      expectNoSensitiveKeys(detail, control.value);
      expectNoSensitiveKeys(createdListItem, control.value);
    }
  });
});
