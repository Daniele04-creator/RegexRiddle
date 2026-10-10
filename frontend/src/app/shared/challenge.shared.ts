import type { ChallengeDifficulty } from "@regexriddle/shared";
import {
  CHALLENGE_CONTROLS_MAX_PER_KIND as SHARED_CHALLENGE_CONTROLS_MAX_PER_KIND,
  CHALLENGE_CONTROLS_MIN_PER_KIND as SHARED_CHALLENGE_CONTROLS_MIN_PER_KIND
} from "@regexriddle/shared";

export const MAX_CONTROLS_PER_KIND = SHARED_CHALLENGE_CONTROLS_MAX_PER_KIND;
export const MIN_CONTROLS_PER_KIND = SHARED_CHALLENGE_CONTROLS_MIN_PER_KIND;
export const REQUIRED_FIELD_MESSAGE = "Obbligatorio";

export type ControlTone = "positive" | "negative";
export type CreateChallengeField =
  | "title"
  | "description"
  | "secretPattern"
  | "positiveExample"
  | "negativeExample"
  | `${ControlTone}Control-${number}`;

export function difficultyLabel(difficulty: ChallengeDifficulty): string {
  if (difficulty === "EASY") {
    return "facile";
  }

  if (difficulty === "MEDIUM") {
    return "media";
  }

  return "difficile";
}

export function difficultyClass(difficulty: ChallengeDifficulty): string {
  if (difficulty === "EASY") {
    return "diff easy";
  }

  if (difficulty === "MEDIUM") {
    return "diff medium";
  }

  return "diff hard";
}

export function isBlank(value: string): boolean {
  return value.trim() === "";
}

export function controlFieldKey(
  tone: ControlTone,
  index: number
): CreateChallengeField {
  return `${tone}Control-${index}`;
}
