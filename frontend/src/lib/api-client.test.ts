import { API_HEALTH_PATH } from "@regexriddle/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { apiGet, apiRequest } from "@/lib/api-client";
import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE } from "@/lib/csrf";

function mockJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status
  });
}

describe("api client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses same-origin paths and includes credentials", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        void input;
        void init;

        return mockJsonResponse({ status: "ok" });
      }
    );
    vi.stubGlobal("fetch", fetchMock);

    await apiGet(API_HEALTH_PATH);

    const init = fetchMock.mock.calls[0]?.[1];

    expect(fetchMock).toHaveBeenCalledWith(
      API_HEALTH_PATH,
      expect.objectContaining({
        credentials: "include",
        method: "GET"
      })
    );
    expect(init?.headers).toBeInstanceOf(Headers);
  });

  it("adds JSON and CSRF headers only for protected mutations", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        void input;
        void init;

        return mockJsonResponse({ success: true });
      }
    );
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest<{ success: true }, { title: string }>("/api/challenges", {
      body: { title: "Future challenge" },
      protectedMutation: true
    });

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = init?.headers as Headers;

    expect(init?.credentials).toBe("include");
    expect(init?.body).toBe(JSON.stringify({ title: "Future challenge" }));
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get(CSRF_HEADER_NAME)).toBe(CSRF_HEADER_VALUE);
  });

  it("rejects absolute API URLs", async () => {
    await expect(apiGet("https://example.test/api")).rejects.toThrow(
      "same-origin"
    );
  });
});
