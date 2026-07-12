import type {
  AttemptSubmissionRequestDTO,
  AttemptSubmissionResponseDTO
} from "@regexriddle/shared";

import { prismaAttemptRepository } from "./attempt.repository.js";
import {
  evaluateAttempt,
  type RegexEvaluationResult
} from "../../regex/attempt-evaluator.js";
import { isSafeRegexError } from "../../regex/regex-engine.js";

type SubmitAttemptResult =
  | ({ status: "created" } & AttemptSubmissionResponseDTO)
  | { status: "not_found" }
  | { status: "forbidden_author" }
  | { status: "already_solved" }
  | { status: "invalid_regex" };

export async function submitAttempt(
  userId: string,
  challengeId: string,
  input: AttemptSubmissionRequestDTO
): Promise<SubmitAttemptResult> {
  const challenge =
    await prismaAttemptRepository.findChallengeWithControls(challengeId);

  if (challenge === null) {
    return { status: "not_found" };
  }

  if (challenge.authorId === userId) {
    return { status: "forbidden_author" };
  }

  let evaluation: RegexEvaluationResult;

  try {
    evaluation = evaluateAttempt(input.pattern, challenge.controls);
  } catch (error) {
    if (isSafeRegexError(error)) {
      return { status: "invalid_regex" };
    }

    throw error;
  }

  async function persistAttempt(): Promise<SubmitAttemptResult> {
    const attempt = await prismaAttemptRepository.createAttempt(
      userId,
      challengeId,
      input,
      evaluation
    );

    if (attempt === null) {
      return { status: "already_solved" };
    }

    return {
      status: "created",
      attempt
    };
  }

  try {
    return await persistAttempt();
  } catch (error) {
    if (!prismaAttemptRepository.isDuplicateAttemptError(error)) {
      throw error;
    }

    return persistAttempt();
  }
}
