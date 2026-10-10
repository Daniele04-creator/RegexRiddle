import { compileSafeRegex, type CompiledSafeRegex } from "./regex-engine.js";

interface ChallengeControlInput {
  kind: "POSITIVE" | "NEGATIVE";
  value: string;
}

export interface RegexEvaluationResult {
  positiveMatched: number;
  positiveTotal: number;
  negativeMatched: number;
  negativeTotal: number;
  isCorrect: boolean;
}

function countControlMatches(
  regex: CompiledSafeRegex,
  controls: ChallengeControlInput[]
) {
  let positiveMatched = 0;
  let positiveTotal = 0;
  let negativeMatched = 0;
  let negativeTotal = 0;

  for (const control of controls) {
    const matched = regex.test(control.value);

    if (control.kind === "POSITIVE") {
      positiveTotal += 1;
      positiveMatched += Number(matched);
      continue;
    }

    negativeTotal += 1;
    negativeMatched += Number(matched);
  }

  return {
    positiveMatched,
    positiveTotal,
    negativeMatched,
    negativeTotal
  };
}

export function evaluateAttempt(
  candidatePattern: string,
  controls: ChallengeControlInput[]
): RegexEvaluationResult {
  const regex = compileSafeRegex(candidatePattern);
  const { positiveMatched, positiveTotal, negativeMatched, negativeTotal } =
    countControlMatches(regex, controls);

  return {
    positiveMatched,
    positiveTotal,
    negativeMatched,
    negativeTotal,
    isCorrect: positiveMatched === positiveTotal && negativeMatched === 0
  };
}

export function matchesAllControls(
  regex: CompiledSafeRegex,
  controls: ChallengeControlInput[]
): boolean {
  const { positiveMatched, positiveTotal, negativeMatched } =
    countControlMatches(regex, controls);

  return positiveMatched === positiveTotal && negativeMatched === 0;
}
