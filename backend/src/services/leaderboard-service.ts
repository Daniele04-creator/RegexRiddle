import type {
  LeaderboardItemDTO,
  LeaderboardResponseDTO
} from "@regexriddle/shared";

import { prisma } from "../db/prisma.js";
import type { LeaderboardQuery } from "../validation/leaderboard-validation.js";

interface LeaderboardAggregate {
  userId: string;
  solvedCount: number;
  averageAttempts: number;
  totalAttemptsUsed: number;
}

interface LeaderboardSortableItem extends LeaderboardItemDTO {
  rawAverageAttempts: number;
}

function roundAverageAttempts(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function listPublicLeaderboard(
  query: LeaderboardQuery
): Promise<LeaderboardResponseDTO> {
  const solutionGroups = await prisma.solution.groupBy({
    by: ["userId"],
    _count: {
      _all: true
    },
    _avg: {
      attemptsUsed: true
    },
    _sum: {
      attemptsUsed: true
    }
  });
  const aggregates: LeaderboardAggregate[] = solutionGroups.map((group) => ({
    userId: group.userId,
    solvedCount: group._count._all,
    averageAttempts: group._avg.attemptsUsed ?? 0,
    totalAttemptsUsed: group._sum.attemptsUsed ?? 0
  }));
  const userIds = aggregates.map((aggregate) => aggregate.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      username: true,
      displayName: true
    }
  });
  const usersById = new Map(users.map((user) => [user.id, user]));
  const sortableItems: LeaderboardSortableItem[] = aggregates.flatMap(
    (aggregate) => {
      const user = usersById.get(aggregate.userId);

      if (user === undefined) {
        return [];
      }

      return [
        {
          rank: 0,
          user: {
            username: user.username,
            displayName: user.displayName
          },
          solvedCount: aggregate.solvedCount,
          averageAttempts: roundAverageAttempts(aggregate.averageAttempts),
          totalAttemptsUsed: aggregate.totalAttemptsUsed,
          rawAverageAttempts: aggregate.averageAttempts
        }
      ];
    }
  );
  const rankedItems: LeaderboardItemDTO[] = sortableItems
    .sort((left, right) => {
      if (left.solvedCount !== right.solvedCount) {
        return right.solvedCount - left.solvedCount;
      }

      if (left.rawAverageAttempts !== right.rawAverageAttempts) {
        return left.rawAverageAttempts - right.rawAverageAttempts;
      }

      return left.user.username.localeCompare(right.user.username);
    })
    .map((item, index) => ({
      user: item.user,
      solvedCount: item.solvedCount,
      averageAttempts: item.averageAttempts,
      totalAttemptsUsed: item.totalAttemptsUsed,
      rank: index + 1
    }));
  const skip = (query.page - 1) * query.limit;

  return {
    items: rankedItems.slice(skip, skip + query.limit),
    page: query.page,
    limit: query.limit,
    total: rankedItems.length
  };
}
