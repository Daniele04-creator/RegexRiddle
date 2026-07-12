import { USERNAME_PATTERN } from "@regexriddle/shared";

import type { ValidationResult } from "./validation-utils.js";

export function parseUsername(value: unknown): ValidationResult<string> {
  if (typeof value !== "string") {
    return { success: false, message: "username must be a string." };
  }

  const username = value.trim().toLowerCase();

  if (!USERNAME_PATTERN.test(username)) {
    return {
      success: false,
      code: "INVALID_USERNAME",
      message:
        "username must be 3-32 lowercase letters, numbers, or underscores."
    };
  }

  return { success: true, value: username };
}
