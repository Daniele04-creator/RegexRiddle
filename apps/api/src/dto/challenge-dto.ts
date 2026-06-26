import type {
  ChallengeDetailDTO,
  ChallengeDifficulty,
  ChallengeListItemDTO
} from "@regexriddle/shared";

interface PublicChallengeRecord {
  id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  publicPositiveExample: string;
  publicNegativeExample: string;
  createdAt: Date;
  updatedAt?: Date;
  author: {
    username: string;
    displayName: string;
  };
  _count: {
    attempts: number;
    solutions: number;
  };
}

export function toChallengeListItemDTO(
  challenge: PublicChallengeRecord
): ChallengeListItemDTO {
  return {
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    difficulty: challenge.difficulty,
    author: {
      username: challenge.author.username,
      displayName: challenge.author.displayName
    },
    publicPositiveExample: challenge.publicPositiveExample,
    publicNegativeExample: challenge.publicNegativeExample,
    createdAt: challenge.createdAt.toISOString(),
    stats: {
      attemptsTotal: challenge._count.attempts,
      solutionsTotal: challenge._count.solutions
    }
  };
}

export function toChallengeDetailDTO(
  challenge: PublicChallengeRecord & { updatedAt: Date }
): ChallengeDetailDTO {
  return {
    ...toChallengeListItemDTO(challenge),
    updatedAt: challenge.updatedAt.toISOString()
  };
}
