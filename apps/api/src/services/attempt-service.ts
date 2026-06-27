import type { AttemptSubmissionResponseDTO } from "@regexriddle/shared";

import { prisma } from "../db/prisma.js";
import {
  publicAttemptResultSelect,
  toAttemptResultDTO
} from "../dto/attempt-dto.js";
import {
  evaluateCandidateAgainstControls,
  type ChallengeControlInput
} from "../regex/attempt-evaluator.js";
import { isSafeRegexError } from "../regex/regex-errors.js";
import type { AttemptSubmissionInput } from "../validation/attempt-validation.js";

export type SubmitAttemptResult =
  | ({ status: "created" } & AttemptSubmissionResponseDTO)
  | { status: "not_found" }
  | { status: "forbidden_author" }
  | { status: "already_solved" }
  | { status: "invalid_regex" };

const challengeAttemptSelect = {
  id: true,
  authorId: true,
  controls: {
    select: {
      kind: true,
      value: true
    }
  }
} as const;

function toControlInputs(
  controls: Array<{ kind: ChallengeControlInput["kind"]; value: string }>
): ChallengeControlInput[] {
  return controls.map((control) => ({
    kind: control.kind,
    value: control.value
  }));
}

export async function submitChallengeAttempt(
  userId: string,
  challengeId: string,
  input: AttemptSubmissionInput
): Promise<SubmitAttemptResult> {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: challengeAttemptSelect
  });

  if (challenge === null) {
    return { status: "not_found" };
  }

  if (challenge.authorId === userId) {
    return { status: "forbidden_author" };
  }

  const existingSolution = await prisma.solution.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId
      }
    },
    select: { id: true }
  });

  if (existingSolution !== null) {
    return { status: "already_solved" };
  }

  let evaluation;

  try {
    evaluation = evaluateCandidateAgainstControls(
      input.pattern,
      input.flags,
      toControlInputs(challenge.controls)
    );
  } catch (error) {
    if (isSafeRegexError(error)) {
      return { status: "invalid_regex" };
    }

    throw error;
  }

  const attempt = await prisma.$transaction(async (tx) => {
    const latestAttempt = await tx.attempt.findFirst({
      where: {
        userId,
        challengeId
      },
      orderBy: { attemptNumber: "desc" },
      select: { attemptNumber: true }
    });
    const attemptNumber = (latestAttempt?.attemptNumber ?? 0) + 1;
    const createdAttempt = await tx.attempt.create({
      data: {
        userId,
        challengeId,
        proposedPattern: input.pattern,
        flags: input.flags,
        positiveMatched: evaluation.positiveMatched,
        positiveTotal: evaluation.positiveTotal,
        negativeMatched: evaluation.negativeMatched,
        negativeTotal: evaluation.negativeTotal,
        isCorrect: evaluation.isCorrect,
        attemptNumber
      },
      select: publicAttemptResultSelect
    });

    if (evaluation.isCorrect) {
      await tx.solution.create({
        data: {
          userId,
          challengeId,
          attemptsUsed: attemptNumber
        }
      });
    }

    return createdAttempt;
  });

  return {
    status: "created",
    attempt: toAttemptResultDTO(attempt),
    solved: attempt.isCorrect
  };
}
