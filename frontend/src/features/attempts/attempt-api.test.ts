import type { AttemptSubmissionResponseDTO } from "@regexriddle/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { submitChallengeAttempt } from "@/features/attempts/api";
import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE } from "@/lib/csrf";

function mockAttemptResponse(): AttemptSubmissionResponseDTO {
  return {
    attempt: {
      id: "bbbbbbbb-1000-4000-8000-000000000001",
      challengeId: "aaaaaaaa-0006-4000-8000-000000000006",
      attemptNumber: 1,
      positiveMatched: 3,
      positiveTotal: 3,
      negativeMatched: 0,
      negativeTotal: 3,
      isCorrect: true,
      createdAt: "2026-06-27T12:00:00.000Z"
    },
    solved: true
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status
  });
}

describe("attempt API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a protected POST with credentials, CSRF, and only pattern plus flags", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        void input;
        void init;

        return jsonResponse(mockAttemptResponse(), 201);
      }
    );
    vi.stubGlobal("fetch", fetchMock);

    await submitChallengeAttempt("aaaaaaaa-0006-4000-8000-000000000006", {
      pattern: String.raw`[A-Z]{2}-\d{4}`,
      flags: "im"
    });

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = init?.headers as Headers;
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/challenges/aaaaaaaa-0006-4000-8000-000000000006/attempts",
      expect.objectContaining({
        credentials: "include",
        method: "POST"
      })
    );
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get(CSRF_HEADER_NAME)).toBe(CSRF_HEADER_VALUE);
    expect(body).toEqual({
      pattern: String.raw`[A-Z]{2}-\d{4}`,
      flags: "im"
    });
  });
});
