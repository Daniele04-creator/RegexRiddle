import type {
  ChallengeDetailDTO,
  ChallengeListResponseDTO
} from "@regexriddle/shared";

import { prisma } from "../db/prisma.js";
import {
  toChallengeDetailDTO,
  toChallengeListItemDTO
} from "../dto/challenge-dto.js";
import type { ChallengeListQuery } from "../validation/challenge-validation.js";

const publicChallengeSelect = {
  id: true,
  title: true,
  description: true,
  difficulty: true,
  publicPositiveExample: true,
  publicNegativeExample: true,
  createdAt: true,
  author: {
    select: {
      username: true,
      displayName: true
    }
  },
  _count: {
    select: {
      attempts: true,
      solutions: true
    }
  }
} as const;

const publicChallengeDetailSelect = {
  ...publicChallengeSelect,
  updatedAt: true
} as const;

export async function listPublicChallenges(
  query: ChallengeListQuery
): Promise<ChallengeListResponseDTO> {
  const skip = (query.page - 1) * query.limit;

  const [total, challenges] = await prisma.$transaction([
    prisma.challenge.count(),
    prisma.challenge.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip,
      take: query.limit,
      select: publicChallengeSelect
    })
  ]);

  return {
    items: challenges.map(toChallengeListItemDTO),
    page: query.page,
    limit: query.limit,
    total
  };
}

export async function getPublicChallengeById(
  id: string
): Promise<ChallengeDetailDTO | null> {
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    select: publicChallengeDetailSelect
  });

  if (challenge === null) {
    return null;
  }

  return toChallengeDetailDTO(challenge);
}
