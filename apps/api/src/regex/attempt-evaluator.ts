import { compileSafeRegex } from "./regex-engine.js";

export type ChallengeControlKind = "POSITIVE" | "NEGATIVE";

export interface ChallengeControlInput {
  kind: ChallengeControlKind;
  value: string;
}

export interface RegexEvaluationResult {
  positiveMatched: number;
  positiveTotal: number;
  negativeMatched: number;
  negativeTotal: number;
  isCorrect: boolean;
}

export interface ChallengeControlVerificationResult {
  isValid: boolean;
  positiveTotal: number;
  negativeTotal: number;
  invalidPositiveCount: number;
  invalidNegativeCount: number;
}

export function evaluateCandidateAgainstControls(
  candidatePattern: string,
  candidateFlags: string,
  controls: ChallengeControlInput[]
): RegexEvaluationResult {
  const regex = compileSafeRegex(candidatePattern, candidateFlags);
  let positiveMatched = 0;
  let positiveTotal = 0;
  let negativeMatched = 0;
  let negativeTotal = 0;

  for (const control of controls) {
    const matched = regex.test(control.value);

    if (control.kind === "POSITIVE") {
      positiveTotal += 1;

      if (matched) {
        positiveMatched += 1;
      }
    }

    if (control.kind === "NEGATIVE") {
      negativeTotal += 1;

      if (!matched) {
        negativeMatched += 1;
      }
    }
  }

  return {
    positiveMatched,
    positiveTotal,
    negativeMatched,
    negativeTotal,
    isCorrect:
      positiveMatched === positiveTotal && negativeMatched === negativeTotal
  };
}

export function verifyChallengeControls(
  secretPattern: string,
  flags: string,
  controls: ChallengeControlInput[]
): ChallengeControlVerificationResult {
  const regex = compileSafeRegex(secretPattern, flags);
  let positiveTotal = 0;
  let negativeTotal = 0;
  let invalidPositiveCount = 0;
  let invalidNegativeCount = 0;

  for (const control of controls) {
    const matched = regex.test(control.value);

    if (control.kind === "POSITIVE") {
      positiveTotal += 1;

      if (!matched) {
        invalidPositiveCount += 1;
      }
    }

    if (control.kind === "NEGATIVE") {
      negativeTotal += 1;

      if (matched) {
        invalidNegativeCount += 1;
      }
    }
  }

  return {
    isValid: invalidPositiveCount === 0 && invalidNegativeCount === 0,
    positiveTotal,
    negativeTotal,
    invalidPositiveCount,
    invalidNegativeCount
  };
}
