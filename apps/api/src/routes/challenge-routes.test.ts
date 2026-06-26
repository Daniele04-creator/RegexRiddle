import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  API_CHALLENGES_PATH,
  type ChallengeDetailDTO,
  type ChallengeListResponseDTO
} from "@regexriddle/shared";

import { buildApp } from "../app.js";

import type { FastifyInstance } from "fastify";

const SEEDED_CHALLENGE_ID = "aaaaaaaa-0001-4000-8000-000000000001";
const MISSING_CHALLENGE_ID = "00000000-0000-4000-8000-000000000000";
const FORBIDDEN_RESPONSE_KEYS = [
  "secretPattern",
  "controls",
  "value",
  "proposedPattern",
  "passwordHash",
  "sessionTokenHash"
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

describe("challenge public routes", () => {
  let app: FastifyInstance;

  beforeAll(() => {
    app = buildApp({ logger: false });
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns a public challenge list with default pagination", async () => {
    const response = await app.inject({
      method: "GET",
      url: API_CHALLENGES_PATH
    });
    const body = response.json<ChallengeListResponseDTO>();

    expect(response.statusCode).toBe(200);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(20);
    expect(body.total).toBeGreaterThanOrEqual(10);
    expect(body.items.length).toBeGreaterThan(0);
    expectNoSensitiveKeys(body);
  });

  it("returns a paginated public challenge list", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_CHALLENGES_PATH}?limit=20&page=1`
    });
    const body = response.json<ChallengeListResponseDTO>();

    expect(response.statusCode).toBe(200);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(20);
    expect(body.total).toBeGreaterThanOrEqual(10);
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items.some((item) => item.title === "Solo cifre")).toBe(true);
    expect(body.items[0]).toHaveProperty("stats.attemptsTotal");
    expect(body.items[0]).toHaveProperty("stats.solutionsTotal");
    expectNoSensitiveKeys(body);
  });

  it("returns public challenge detail", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_CHALLENGES_PATH}/${SEEDED_CHALLENGE_ID}`
    });
    const body = response.json<ChallengeDetailDTO>();

    expect(response.statusCode).toBe(200);
    expect(body.id).toBe(SEEDED_CHALLENGE_ID);
    expect(body.title).toBe("Solo cifre");
    expect(body.author).toHaveProperty("displayName");
    expect(body.author).toHaveProperty("username");
    expect(body).toHaveProperty("updatedAt");
    expectNoSensitiveKeys(body);
  });

  it("rejects invalid query parameters", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_CHALLENGES_PATH}?include=controls`
    });

    expect(response.statusCode).toBe(400);
    expectNoSensitiveKeys(response.json());
  });

  it("rejects invalid challenge ids", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_CHALLENGES_PATH}/not-a-uuid`
    });

    expect(response.statusCode).toBe(400);
    expectNoSensitiveKeys(response.json());
  });

  it("returns 404 for unknown challenge ids", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_CHALLENGES_PATH}/${MISSING_CHALLENGE_ID}`
    });

    expect(response.statusCode).toBe(404);
    expectNoSensitiveKeys(response.json());
  });
});
