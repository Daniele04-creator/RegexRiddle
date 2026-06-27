import type {
  ChallengeDetailDTO,
  ChallengeListItemDTO,
  ChallengeListResponseDTO,
  LeaderboardResponseDTO
} from "@regexriddle/shared";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderRoute } from "@/test/render";
import { mockAppFetch } from "@/test/mockFetch";

const challengeApiMocks = vi.hoisted(() => ({
  getChallengeDetail: vi.fn(),
  getChallenges: vi.fn()
}));

const leaderboardApiMocks = vi.hoisted(() => ({
  getLeaderboard: vi.fn()
}));

vi.mock("@/features/challenges/api", () => challengeApiMocks);
vi.mock("@/features/leaderboard/api", () => leaderboardApiMocks);

function mockHealthFetch() {
  mockAppFetch();
}

function makeChallenge(
  overrides: Partial<ChallengeListItemDTO> = {}
): ChallengeListItemDTO {
  return {
    id: "aaaaaaaa-0001-4000-8000-000000000001",
    title: "Solo cifre",
    description: "Match strings made only of one or more decimal digits.",
    difficulty: "EASY",
    author: {
      username: "demo_creator",
      displayName: "Demo Creator"
    },
    publicPositiveExample: "12345",
    publicNegativeExample: "abc123",
    createdAt: "2026-06-27T08:00:00.000Z",
    stats: {
      attemptsTotal: 2,
      solutionsTotal: 1
    },
    ...overrides
  };
}

function makeChallengeListResponse(
  overrides: Partial<ChallengeListResponseDTO> = {}
): ChallengeListResponseDTO {
  return {
    items: [makeChallenge()],
    page: 1,
    limit: 9,
    total: 1,
    ...overrides
  };
}

function makeChallengeDetail(
  overrides: Partial<ChallengeDetailDTO> = {}
): ChallengeDetailDTO {
  return {
    ...makeChallenge(),
    updatedAt: "2026-06-27T09:00:00.000Z",
    ...overrides
  };
}

function makeLeaderboardResponse(
  overrides: Partial<LeaderboardResponseDTO> = {}
): LeaderboardResponseDTO {
  return {
    items: [
      {
        rank: 1,
        user: {
          username: "demo_player",
          displayName: "Demo Player"
        },
        solvedCount: 3,
        averageAttempts: 1.67,
        totalAttemptsUsed: 5
      }
    ],
    page: 1,
    limit: 10,
    total: 1,
    ...overrides
  };
}

describe("public data pages", () => {
  beforeEach(() => {
    mockHealthFetch();
    challengeApiMocks.getChallenges.mockReset();
    challengeApiMocks.getChallengeDetail.mockReset();
    leaderboardApiMocks.getLeaderboard.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders challenge catalog loading, success, empty, and error states", async () => {
    challengeApiMocks.getChallenges.mockReturnValueOnce(new Promise(() => undefined));
    const loading = renderRoute("/challenges");

    expect(screen.getByLabelText("Caricamento sfide")).toBeInTheDocument();
    loading.unmount();

    challengeApiMocks.getChallenges.mockReset();
    challengeApiMocks.getChallenges.mockResolvedValueOnce(makeChallengeListResponse());
    const success = renderRoute("/challenges");

    expect(
      await screen.findByRole("heading", { name: "Scegli il tuo prossimo enigma" })
    ).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Solo cifre" })).toBeInTheDocument();
    expect(screen.getByText("12345")).toBeInTheDocument();
    success.unmount();

    challengeApiMocks.getChallenges.mockResolvedValueOnce(
      makeChallengeListResponse({ items: [], total: 0 })
    );
    const empty = renderRoute("/challenges");

    expect(await screen.findByText("Nessuna sfida pubblica")).toBeInTheDocument();
    empty.unmount();

    challengeApiMocks.getChallenges.mockRejectedValue(new Error("network"));
    renderRoute("/challenges");

    expect(await screen.findByRole("alert", undefined, { timeout: 4000 })).toHaveTextContent(
      "Catalogo non disponibile"
    );
  });

  it("does not render forbidden challenge fields from extra mock keys", async () => {
    const maliciousChallenge = {
      ...makeChallenge(),
      secretPattern: "SHOULD_NOT_RENDER",
      controls: [{ value: "HIDDEN_CONTROL" }],
      proposedPattern: "SUBMITTED_PATTERN",
      passwordHash: "PASSWORD_HASH",
      sessionTokenHash: "SESSION_HASH"
    } as unknown as ChallengeListItemDTO;
    challengeApiMocks.getChallenges.mockResolvedValue(
      makeChallengeListResponse({ items: [maliciousChallenge] })
    );

    renderRoute("/challenges");

    expect(await screen.findByRole("heading", { name: "Solo cifre" })).toBeInTheDocument();
    expect(screen.queryByText("SHOULD_NOT_RENDER")).not.toBeInTheDocument();
    expect(screen.queryByText("HIDDEN_CONTROL")).not.toBeInTheDocument();
    expect(screen.queryByText("SUBMITTED_PATTERN")).not.toBeInTheDocument();
    expect(screen.queryByText("PASSWORD_HASH")).not.toBeInTheDocument();
    expect(screen.queryByText("SESSION_HASH")).not.toBeInTheDocument();
  });

  it("renders public challenge detail examples and stats", async () => {
    challengeApiMocks.getChallengeDetail.mockResolvedValue(makeChallengeDetail());

    renderRoute("/challenges/aaaaaaaa-0001-4000-8000-000000000001");

    expect(await screen.findByRole("heading", { name: "Solo cifre" })).toBeInTheDocument();
    expect(screen.getByText("12345")).toBeInTheDocument();
    expect(screen.getByText("abc123")).toBeInTheDocument();
    expect(screen.getByText("2 tentativi")).toBeInTheDocument();
    expect(screen.getByText("1 soluzione")).toBeInTheDocument();
    expect(await screen.findByText("Accedi per salvare il tentativo")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Accedi" })[0]).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("renders leaderboard ranking metrics without private identity fields", async () => {
    const maliciousLeaderboard = {
      ...makeLeaderboardResponse(),
      items: [
        {
          ...makeLeaderboardResponse().items[0],
          id: "USER_ID",
          email: "demo@example.test",
          secretPattern: "SHOULD_NOT_RENDER"
        }
      ]
    } as unknown as LeaderboardResponseDTO;
    leaderboardApiMocks.getLeaderboard.mockResolvedValue(maliciousLeaderboard);

    renderRoute("/leaderboard");

    expect(
      await screen.findByRole("heading", { name: "Classifica solver" })
    ).toBeInTheDocument();
    expect((await screen.findAllByText("Demo Player"))[0]).toBeInTheDocument();
    expect(screen.getAllByText("#1")[0]).toBeInTheDocument();
    expect(screen.getAllByText("3")[0]).toBeInTheDocument();
    expect(screen.getAllByText("1,67")[0]).toBeInTheDocument();
    expect(screen.getAllByText("5")[0]).toBeInTheDocument();
    expect(screen.queryByText("demo@example.test")).not.toBeInTheDocument();
    expect(screen.queryByText("USER_ID")).not.toBeInTheDocument();
    expect(screen.queryByText("SHOULD_NOT_RENDER")).not.toBeInTheDocument();
  });

  it("updates catalog pagination through URL state", async () => {
    const user = userEvent.setup();
    challengeApiMocks.getChallenges.mockResolvedValue(
      makeChallengeListResponse({ total: 10 })
    );

    renderRoute("/challenges");

    await screen.findByRole("heading", { name: "Solo cifre" });
    await user.click(screen.getByRole("button", { name: /Successiva/ }));

    expect(challengeApiMocks.getChallenges).toHaveBeenLastCalledWith(
      { page: 2, limit: 9 },
      expect.any(AbortSignal)
    );
  });
});
