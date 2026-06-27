import {
  API_CHALLENGES_PATH,
  type ChallengeCreateRequestDTO,
  type ChallengeDetailDTO
} from "@regexriddle/shared";

import { apiRequest } from "@/lib/api-client";

export type CreateChallengeInput = ChallengeCreateRequestDTO;

type ChallengeCreateBody = ChallengeCreateRequestDTO & Record<string, unknown>;

export function createChallenge(input: CreateChallengeInput) {
  const body: ChallengeCreateBody = {
    controls: input.controls,
    description: input.description,
    difficulty: input.difficulty,
    flags: input.flags ?? "",
    publicNegativeExample: input.publicNegativeExample,
    publicPositiveExample: input.publicPositiveExample,
    secretPattern: input.secretPattern,
    title: input.title
  };

  return apiRequest<ChallengeDetailDTO, ChallengeCreateBody>(API_CHALLENGES_PATH, {
    body,
    method: "POST",
    protectedMutation: true
  });
}
