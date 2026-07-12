import type { ValidationResult } from "./validation-utils.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseUuidParam(
  value: unknown,
  fieldName = "id"
): ValidationResult<string> {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    return { success: false, message: `${fieldName} must be a valid UUID.` };
  }

  return { success: true, value };
}
