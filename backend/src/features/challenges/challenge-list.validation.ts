import type { ChallengeDifficulty } from "@regexriddle/shared";

import {
  hasOnlyAllowedKeys,
  type ValidationResult
} from "../../core/validation/validation-utils.js";

export interface ChallengeListQuery {
  difficulty?: ChallengeDifficulty;
}

const ALLOWED_LIST_QUERY_KEYS = new Set(["difficulty"]);

export function parseChallengeListQuery(
  query: unknown
): ValidationResult<ChallengeListQuery> {
  if (query === null || typeof query !== "object" || Array.isArray(query)) {
    return { success: false, message: "Invalid query parameters." };
  }

  const record = query as Record<string, unknown>;

  if (!hasOnlyAllowedKeys(record, ALLOWED_LIST_QUERY_KEYS)) {
    return { success: false, message: "Unsupported query parameter." };
  }

  if (!Object.hasOwn(record, "difficulty")) {
    return { success: true, value: { difficulty: undefined } };
  }

  const rawDifficulty = record.difficulty;

  if (typeof rawDifficulty !== "string") {
    return { success: false, message: "Unsupported query parameter." };
  }

  const difficulty = rawDifficulty.trim();

  if (difficulty === "") {
    return { success: true, value: { difficulty: undefined } };
  }

  if (
    difficulty !== "EASY" &&
    difficulty !== "MEDIUM" &&
    difficulty !== "HARD"
  ) {
    return {
      success: false,
      message: "difficulty must be EASY, MEDIUM, or HARD."
    };
  }

  return {
    success: true,
    value: { difficulty }
  };
}
