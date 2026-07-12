import type {
  ChallengeDetailDTO,
  ChallengeDifficulty,
  ChallengeListItemDTO,
  ChallengeViewerStateDTO
} from "@regexriddle/shared";

export interface PublicChallengeRecord {
  id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  publicPositiveExample: string;
  publicNegativeExample: string;
  createdAt: Date;
  author: {
    username: string;
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
      username: challenge.author.username
    },
    publicPositiveExample: challenge.publicPositiveExample,
    publicNegativeExample: challenge.publicNegativeExample,
    createdAt: challenge.createdAt.toISOString()
  };
}

export function toChallengeDetailDTO(
  challenge: PublicChallengeRecord,
  viewer?: ChallengeViewerStateDTO | null
): ChallengeDetailDTO {
  return {
    ...toChallengeListItemDTO(challenge),
    viewer: viewer ?? null
  };
}
