import { Injectable } from "@angular/core";
import {
  API_CHALLENGES_PATH,
  type AttemptSubmissionRequestDTO,
  type AttemptSubmissionResponseDTO,
  type ChallengeCreateRequestDTO,
  type ChallengeDetailDTO
} from "@regexriddle/shared";

import { apiErrorCode, ApiService, errorMessage } from "../../core/api.service";

type AttemptSubmissionFailure =
  | "already_solved"
  | "forbidden_author"
  | "invalid_regex"
  | "unauthorized"
  | "unavailable";

@Injectable({ providedIn: "root" })
export class ChallengeApiService {
  constructor(private readonly api: ApiService) {}

  createChallenge(
    payload: ChallengeCreateRequestDTO
  ): Promise<ChallengeDetailDTO> {
    return this.api.post<ChallengeDetailDTO>(API_CHALLENGES_PATH, payload);
  }

  getChallenge(challengeId: string): Promise<ChallengeDetailDTO> {
    return this.api.get<ChallengeDetailDTO>(
      `${API_CHALLENGES_PATH}/${challengeId}`
    );
  }

  submitAttempt(
    challengeId: string,
    pattern: string
  ): Promise<AttemptSubmissionResponseDTO> {
    const payload: AttemptSubmissionRequestDTO = { pattern };

    return this.api.post<AttemptSubmissionResponseDTO>(
      `${API_CHALLENGES_PATH}/${challengeId}/attempts`,
      payload
    );
  }
}

export function createChallengeSubmissionMessage(error: unknown): string {
  return apiErrorCode(error) === "INCOHERENT_CHALLENGE"
    ? "La soluzione, gli indizi o le prove nascoste non sono coerenti."
    : errorMessage(error, "Impossibile pubblicare questa sfida.");
}

export function classifyAttemptSubmissionFailure(
  error: unknown
): AttemptSubmissionFailure {
  const code = apiErrorCode(error);

  if (code === "UNAUTHORIZED") {
    return "unauthorized";
  }

  if (code === "CHALLENGE_ALREADY_SOLVED") {
    return "already_solved";
  }

  if (code === "INVALID_REGEX") {
    return "invalid_regex";
  }

  if (code === "AUTHOR_CANNOT_ATTEMPT") {
    return "forbidden_author";
  }

  return "unavailable";
}

export function attemptSubmissionErrorMessage(
  failure: AttemptSubmissionFailure
): string | null {
  switch (failure) {
    case "invalid_regex":
      return "Regex non valida per questo enigma.";
    case "forbidden_author":
      return "Gli autori non possono risolvere le proprie sfide.";
    case "unavailable":
      return "Impossibile inviare questa regex.";
    case "already_solved":
    case "unauthorized":
      return null;
  }
}
