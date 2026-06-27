import { afterEach, describe, expect, it, vi } from "vitest";

import { updateCurrentUser } from "@/features/account/api";

function mockJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status
  });
}

describe("account API functions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("patches the current user through the protected same-origin API", async () => {
    const fetchMock = vi.fn(async (...args: Parameters<typeof fetch>) => {
      void args;

      return mockJsonResponse({
        user: {
          id: "22222222-2222-4222-8222-222222222222",
          username: "demo_player",
          email: "demo_player@example.test",
          displayName: "Account Demo",
          bio: "Bio aggiornata.",
          avatarUrl: "https://example.com/avatar.png",
          createdAt: "2026-06-27T08:00:00.000Z"
        }
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      updateCurrentUser({
        avatarUrl: "https://example.com/avatar.png",
        bio: "Bio aggiornata.",
        displayName: "Account Demo",
        email: "must-not-send@example.test",
        id: "must-not-send",
        password: "must-not-send"
      } as never)
    ).resolves.toMatchObject({
      username: "demo_player",
      displayName: "Account Demo"
    });

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = new Headers(init?.headers);
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/me",
      expect.objectContaining({
        credentials: "include",
        method: "PATCH"
      })
    );
    expect(headers.get("X-RegexRiddle-CSRF")).toBe("1");
    expect(body).toEqual({
      avatarUrl: "https://example.com/avatar.png",
      bio: "Bio aggiornata.",
      displayName: "Account Demo"
    });
    expect(body).not.toHaveProperty("email");
    expect(body).not.toHaveProperty("id");
    expect(body).not.toHaveProperty("password");
  });
});
