export interface LeaderboardQuery {
  page: number;
  limit: number;
}

interface ValidationSuccess<T> {
  success: true;
  value: T;
}

interface ValidationFailure {
  success: false;
  message: string;
}

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_PAGE = 1_000;
const MAX_LIMIT = 50;
const ALLOWED_LEADERBOARD_QUERY_KEYS = new Set(["page", "limit"]);

function readSingleQueryValue(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === "string" ? value : undefined;
}

function parsePositiveInteger(
  value: string | undefined,
  fallback: number
): number | null {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

export function parseLeaderboardQuery(
  query: unknown
): ValidationResult<LeaderboardQuery> {
  if (query === null || typeof query !== "object" || Array.isArray(query)) {
    return { success: false, message: "Invalid query parameters." };
  }

  for (const [key, value] of Object.entries(query)) {
    if (!ALLOWED_LEADERBOARD_QUERY_KEYS.has(key) || typeof value !== "string") {
      return { success: false, message: "Unsupported query parameter." };
    }
  }

  const record = query as Record<string, unknown>;
  const page = parsePositiveInteger(
    readSingleQueryValue(record.page),
    DEFAULT_PAGE
  );
  const limit = parsePositiveInteger(
    readSingleQueryValue(record.limit),
    DEFAULT_LIMIT
  );

  if (page === null || page > MAX_PAGE) {
    return { success: false, message: "page must be between 1 and 1000." };
  }

  if (limit === null || limit > MAX_LIMIT) {
    return { success: false, message: "limit must be between 1 and 50." };
  }

  return {
    success: true,
    value: { page, limit }
  };
}
