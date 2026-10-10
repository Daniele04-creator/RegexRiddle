import {
  CHALLENGE_LIST_DEFAULT_PAGE_SIZE,
  CHALLENGE_LIST_MAX_PAGE_SIZE,
  type ChallengeDifficulty
} from "@regexriddle/shared";

import {
  hasOnlyAllowedKeys,
  type ValidationResult
} from "../../core/validation/validation-utils.js";

export interface ChallengeListQuery {
  difficulty?: ChallengeDifficulty;
  page: number;
  pageSize: number;
}

const ALLOWED_LIST_QUERY_KEYS = new Set(["difficulty", "page", "pageSize"]);

function parsePositiveInteger(value: unknown, fallback: number): number | null {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

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

  const page = parsePositiveInteger(record.page, 1);
  const pageSize = parsePositiveInteger(
    record.pageSize,
    CHALLENGE_LIST_DEFAULT_PAGE_SIZE
  );

  if (page === null) {
    return { success: false, message: "page must be a positive integer." };
  }

  if (pageSize === null || pageSize > CHALLENGE_LIST_MAX_PAGE_SIZE) {
    return {
      success: false,
      message: `pageSize must be an integer between 1 and ${CHALLENGE_LIST_MAX_PAGE_SIZE}.`
    };
  }

  if ((page - 1) * pageSize > 2_147_483_647) {
    return { success: false, message: "page exceeds the supported range." };
  }

  if (!Object.hasOwn(record, "difficulty")) {
    return { success: true, value: { difficulty: undefined, page, pageSize } };
  }

  const rawDifficulty = record.difficulty;

  if (typeof rawDifficulty !== "string") {
    return { success: false, message: "Unsupported query parameter." };
  }

  const difficulty = rawDifficulty.trim();

  if (difficulty === "") {
    return { success: true, value: { difficulty: undefined, page, pageSize } };
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
    value: { difficulty, page, pageSize }
  };
}
