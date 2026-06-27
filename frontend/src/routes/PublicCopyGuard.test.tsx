import type {
  ChallengeListResponseDTO,
  LeaderboardResponseDTO
} from "@regexriddle/shared";
import { cleanup, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockAppFetch } from "@/test/mockFetch";
import { renderRoute } from "@/test/render";

const challengeApiMocks = vi.hoisted(() => ({
  getChallengeDetail: vi.fn(),
  getChallenges: vi.fn()
}));

const leaderboardApiMocks = vi.hoisted(() => ({
  getLeaderboard: vi.fn()
}));

vi.mock("@/features/challenges/api", () => challengeApiMocks);
vi.mock("@/features/leaderboard/api", () => leaderboardApiMocks);

const forbiddenPublicCopy = [
  "API",
  "GET /api",
  "POST /api",
  "GOAL",
  "server-side",
  "RE2",
  "HttpOnly",
  "CSRF",
  "DTO",
  "token storage",
  "Fastify",
  "Prisma",
  "Docker"
] as const;

const publicPages = [
  {
    heading: "Risolvi enigmi nascosti con una sola regex",
    path: "/"
  },
  {
    heading: "Cinque mosse per risolvere un enigma regex",
    path: "/how-it-works"
  },
  {
    heading: "Scegli il tuo prossimo enigma",
    path: "/challenges"
  },
  {
    heading: "Classifica solver",
    path: "/leaderboard"
  },
  {
    heading: "Bentornato nel laboratorio",
    path: "/login"
  },
  {
    heading: "Crea il tuo profilo solver",
    path: "/register"
  }
] as const;

function makeChallengeListResponse(): ChallengeListResponseDTO {
  return {
    items: [
      {
        id: "aaaaaaaa-0001-4000-8000-000000000001",
        title: "Solo cifre",
        description: "Riconosci stringhe composte solo da cifre.",
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
        }
      }
    ],
    limit: 9,
    page: 1,
    total: 1
  };
}

function makeLeaderboardResponse(): LeaderboardResponseDTO {
  return {
    items: [
      {
        averageAttempts: 1.67,
        rank: 1,
        solvedCount: 3,
        totalAttemptsUsed: 5,
        user: {
          displayName: "Demo Player",
          username: "demo_player"
        }
      }
    ],
    limit: 10,
    page: 1,
    total: 1
  };
}

describe("public UX copy guard", () => {
  beforeEach(() => {
    mockAppFetch();
    challengeApiMocks.getChallenges.mockResolvedValue(makeChallengeListResponse());
    challengeApiMocks.getChallengeDetail.mockResolvedValue(undefined);
    leaderboardApiMocks.getLeaderboard.mockResolvedValue(makeLeaderboardResponse());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  for (const page of publicPages) {
    it(`keeps technical copy off ${page.path}`, async () => {
      renderRoute(page.path);

      expect(
        await screen.findByRole("heading", {
          level: 1,
          name: page.heading
        })
      ).toBeInTheDocument();

      const renderedText = document.body.textContent ?? "";

      for (const forbidden of forbiddenPublicCopy) {
        expect(renderedText).not.toContain(forbidden);
      }
    });
  }
});
