import type {
  AttemptResultDTO,
  AttemptSubmissionRequestDTO
} from "@regexriddle/shared";

import { prisma } from "../../core/db/prisma.js";
import { isPrismaErrorCode } from "../../core/db/prisma-errors.js";
import type { RegexEvaluationResult } from "../../regex/attempt-evaluator.js";

const publicAttemptResultSelect = {
  id: true,
  attemptNumber: true,
  positiveMatched: true,
  positiveTotal: true,
  negativeMatched: true,
  negativeTotal: true,
  isCorrect: true
} as const;

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

export const prismaAttemptRepository = {
  createAttempt(
    userId: string,
    challengeId: string,
    input: AttemptSubmissionRequestDTO,
    evaluation: RegexEvaluationResult
  ): Promise<AttemptResultDTO | null> {
    return prisma.$transaction(async (tx) => {
      const existingSolution = await tx.solution.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId
          }
        },
        select: { id: true }
      });

      if (existingSolution !== null) {
        return null;
      }

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
  },

  findChallengeWithControls(challengeId: string) {
    return prisma.challenge.findUnique({
      where: { id: challengeId },
      select: challengeAttemptSelect
    });
  },

  isDuplicateAttemptError(error: unknown): boolean {
    return isPrismaErrorCode(error, "P2002");
  }
};
