import type { ChallengeDetailDTO } from "@regexriddle/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createChallenge, type CreateChallengeInput } from "@/features/challenge-authoring/api";
import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE } from "@/lib/csrf";

function mockChallengeDetail(): ChallengeDetailDTO {
  return {
    author: {
      displayName: "Demo Player",
      username: "demo_player"
    },
    createdAt: "2026-06-27T12:00:00.000Z",
    description: "Create a regex that matches five-digit Italian postal codes.",
    difficulty: "EASY",
    id: "aaaaaaaa-1000-4000-8000-000000000001",
    publicNegativeExample: "8012A",
    publicPositiveExample: "80125",
    stats: {
      attemptsTotal: 0,
      solutionsTotal: 0
    },
    title: "CAP italiano",
    updatedAt: "2026-06-27T12:00:00.000Z"
  };
}

function validInput(): CreateChallengeInput {
  return {
    controls: [
      { kind: "POSITIVE", value: "00100" },
      { kind: "POSITIVE", value: "20121" },
      { kind: "POSITIVE", value: "99999" },
      { kind: "NEGATIVE", value: "1234" },
      { kind: "NEGATIVE", value: "ABCDE" },
      { kind: "NEGATIVE", value: "123456" }
    ],
    description: "Create a regex that matches five-digit Italian postal codes.",
    difficulty: "EASY",
    flags: "im",
    publicNegativeExample: "8012A",
    publicPositiveExample: "80125",
    secretPattern: String.raw`[0-9]{5}`,
    title: "CAP italiano"
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status
  });
}

describe("challenge creation API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a protected POST with credentials, CSRF, and only creation fields", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        void input;
        void init;

        return jsonResponse(mockChallengeDetail(), 201);
      }
    );
    const input = validInput();

    vi.stubGlobal("fetch", fetchMock);

    await createChallenge(input);

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = init?.headers as Headers;
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/challenges",
      expect.objectContaining({
        credentials: "include",
        method: "POST"
      })
    );
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get(CSRF_HEADER_NAME)).toBe(CSRF_HEADER_VALUE);
    expect(body).toEqual(input);
    expect(Object.keys(body).sort()).toEqual([
      "controls",
      "description",
      "difficulty",
      "flags",
      "publicNegativeExample",
      "publicPositiveExample",
      "secretPattern",
      "title"
    ]);
  });
});
