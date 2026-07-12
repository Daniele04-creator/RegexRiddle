import type { PublicApiErrorCode } from "@regexriddle/shared";

export type ValidationResult<T> =
  | { success: true; value: T }
  | { success: false; message: string; code?: PublicApiErrorCode };

export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

export function hasOnlyAllowedKeys(
  body: Record<string, unknown>,
  allowedKeys: ReadonlySet<string>
): boolean {
  return Object.keys(body).every((key) => allowedKeys.has(key));
}

export function readRequiredString(
  body: Record<string, unknown>,
  key: string
): string | null {
  const value = body[key];

  if (typeof value !== "string") {
    return null;
  }

  return value;
}

export function isStringLengthInRange(
  value: unknown,
  minLength: number,
  maxLength: number
): value is string {
  return (
    typeof value === "string" &&
    value.length >= minLength &&
    value.length <= maxLength
  );
}
