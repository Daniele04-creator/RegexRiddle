import {
  API_CHALLENGES_PATH,
  type AttemptSubmissionRequestDTO,
  type AttemptSubmissionResponseDTO
} from "@regexriddle/shared";

import { apiRequest } from "@/lib/api-client";

export interface SubmitChallengeAttemptInput {
  flags: string;
  pattern: string;
}

type AttemptSubmissionBody = AttemptSubmissionRequestDTO & Record<string, unknown>;

export function submitChallengeAttempt(
  challengeId: string,
  input: SubmitChallengeAttemptInput
) {
  const body: AttemptSubmissionBody = {
    pattern: input.pattern,
    flags: input.flags
  };

  return apiRequest<AttemptSubmissionResponseDTO, AttemptSubmissionBody>(
    `${API_CHALLENGES_PATH}/${encodeURIComponent(challengeId)}/attempts`,
    {
      body,
      method: "POST",
      protectedMutation: true
    }
  );
}
