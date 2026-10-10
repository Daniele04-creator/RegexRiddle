import {
  hasOnlyAllowedKeys,
  isPlainObject,
  type ValidationResult
} from "../../core/validation/validation-utils.js";
import type { AttemptSubmissionRequestDTO } from "@regexriddle/shared";
import { CHALLENGE_PATTERN_MAX_LENGTH } from "@regexriddle/shared";

const ALLOWED_ATTEMPT_BODY_KEYS = new Set(["pattern"]);

export function parseAttemptSubmissionBody(
  body: unknown
): ValidationResult<AttemptSubmissionRequestDTO> {
  if (!isPlainObject(body)) {
    return { success: false, message: "Request body must be a JSON object." };
  }

  if (!hasOnlyAllowedKeys(body, ALLOWED_ATTEMPT_BODY_KEYS)) {
    return { success: false, message: "Unsupported request body field." };
  }

  const pattern = body.pattern;

  if (typeof pattern !== "string") {
    return { success: false, message: "pattern must be a string." };
  }

  if (pattern.length > CHALLENGE_PATTERN_MAX_LENGTH) {
    return {
      success: false,
      message: `pattern must be at most ${CHALLENGE_PATTERN_MAX_LENGTH} characters.`
    };
  }

  return {
    success: true,
    value: {
      pattern
    }
  };
}
