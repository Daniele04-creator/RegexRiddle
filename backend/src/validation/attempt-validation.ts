import type { AttemptSubmissionRequestDTO } from "@regexriddle/shared";

interface ValidationSuccess<T> {
  success: true;
  value: T;
}

interface ValidationFailure {
  success: false;
  message: string;
}

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export interface AttemptSubmissionInput {
  pattern: string;
  flags: string;
}

const MAX_PATTERN_LENGTH = 256;
const ALLOWED_ATTEMPT_BODY_KEYS = new Set(["pattern", "flags"]);

export function parseAttemptSubmissionBody(
  body: unknown
): ValidationResult<AttemptSubmissionInput> {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { success: false, message: "Request body must be a JSON object." };
  }

  const entries = Object.entries(body);

  for (const [key] of entries) {
    if (!ALLOWED_ATTEMPT_BODY_KEYS.has(key)) {
      return { success: false, message: "Unsupported request body field." };
    }
  }

  const payload = body as Partial<AttemptSubmissionRequestDTO>;

  if (typeof payload.pattern !== "string") {
    return { success: false, message: "pattern must be a string." };
  }

  if (payload.pattern.length > MAX_PATTERN_LENGTH) {
    return {
      success: false,
      message: "pattern must be at most 256 characters."
    };
  }

  if (payload.flags !== undefined && typeof payload.flags !== "string") {
    return { success: false, message: "flags must be a string." };
  }

  return {
    success: true,
    value: {
      pattern: payload.pattern,
      flags: payload.flags ?? ""
    }
  };
}
