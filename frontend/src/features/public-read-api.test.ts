import { afterEach, describe, expect, it, vi } from "vitest";

import { getChallenges, getChallengeDetail } from "@/features/challenges/api";
import { getLeaderboard } from "@/features/leaderboard/api";

function mockJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status
  });
}

describe("public read API functions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads challenge catalog through the same-origin client with credentials", async () => {
    const fetchMock = vi.fn(async () =>
      mockJsonResponse({ items: [], page: 1, limit: 9, total: 0 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await getChallenges({ page: 1, limit: 9 });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/challenges?page=1&limit=9",
      expect.objectContaining({
        credentials: "include",
        method: "GET"
      })
    );
  });

  it("loads challenge detail through the same-origin client with credentials", async () => {
    const fetchMock = vi.fn(async () =>
      mockJsonResponse({
        id: "aaaaaaaa-0001-4000-8000-000000000001",
        title: "Solo cifre"
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await getChallengeDetail("aaaaaaaa-0001-4000-8000-000000000001");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/challenges/aaaaaaaa-0001-4000-8000-000000000001",
      expect.objectContaining({
        credentials: "include",
        method: "GET"
      })
    );
  });

  it("loads leaderboard through the same-origin client with credentials", async () => {
    const fetchMock = vi.fn(async () =>
      mockJsonResponse({ items: [], page: 1, limit: 10, total: 0 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await getLeaderboard({ page: 1, limit: 10 });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/leaderboard?page=1&limit=10",
      expect.objectContaining({
        credentials: "include",
        method: "GET"
      })
    );
  });
});
