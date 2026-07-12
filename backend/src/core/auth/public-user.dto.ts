import type { PublicUserDTO } from "@regexriddle/shared";

export interface PublicUserRecord {
  id: string;
  username: string;
  avatarUrl: string | null;
  createdAt: Date;
  _count: {
    solutions: number;
    challenges: number;
    attempts: number;
  };
  solutions: Array<{
    attemptsUsed: number;
    challenge: {
      id: string;
      title: string;
      difficulty: PublicUserDTO["solvedChallenges"][number]["difficulty"];
    };
  }>;
  challenges: Array<{
    id: string;
    title: string;
    difficulty: PublicUserDTO["createdChallenges"][number]["difficulty"];
    _count: {
      solutions: number;
    };
  }>;
}

export const publicUserSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  createdAt: true,
  _count: {
    select: {
      solutions: true,
      challenges: true,
      attempts: true
    }
  },
  solutions: {
    orderBy: { solvedAt: "desc" },
    select: {
      attemptsUsed: true,
      challenge: {
        select: {
          id: true,
          title: true,
          difficulty: true
        }
      }
    }
  },
  challenges: {
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      difficulty: true,
      _count: {
        select: {
          solutions: true
        }
      }
    }
  }
} as const;

export function toPublicUserDTO(user: PublicUserRecord): PublicUserDTO {
  return {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    stats: {
      solvedTotal: user._count.solutions,
      createdTotal: user._count.challenges,
      attemptsTotal: user._count.attempts
    },
    solvedChallenges: user.solutions.map((solution) => ({
      id: solution.challenge.id,
      title: solution.challenge.title,
      difficulty: solution.challenge.difficulty,
      attemptsUsed: solution.attemptsUsed
    })),
    createdChallenges: user.challenges.map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      difficulty: challenge.difficulty,
      solversTotal: challenge._count.solutions
    }))
  };
}
