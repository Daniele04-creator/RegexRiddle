import type { AttemptResultDTO } from "@regexriddle/shared";

export interface AttemptResultRecord {
  id: string;
  challengeId: string;
  attemptNumber: number;
  positiveMatched: number;
  positiveTotal: number;
  negativeMatched: number;
  negativeTotal: number;
  isCorrect: boolean;
  createdAt: Date;
}

export const publicAttemptResultSelect = {
  id: true,
  challengeId: true,
  attemptNumber: true,
  positiveMatched: true,
  positiveTotal: true,
  negativeMatched: true,
  negativeTotal: true,
  isCorrect: true,
  createdAt: true
} as const;

export function toAttemptResultDTO(
  attempt: AttemptResultRecord
): AttemptResultDTO {
  return {
    id: attempt.id,
    challengeId: attempt.challengeId,
    attemptNumber: attempt.attemptNumber,
    positiveMatched: attempt.positiveMatched,
    positiveTotal: attempt.positiveTotal,
    negativeMatched: attempt.negativeMatched,
    negativeTotal: attempt.negativeTotal,
    isCorrect: attempt.isCorrect,
    createdAt: attempt.createdAt.toISOString()
  };
}
