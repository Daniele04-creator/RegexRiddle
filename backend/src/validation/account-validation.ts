export interface AccountUpdateInput {
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
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

const ACCOUNT_UPDATE_KEYS = new Set(["displayName", "bio", "avatarUrl"]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyAllowedKeys(
  body: Record<string, unknown>,
  allowedKeys: Set<string>
): boolean {
  return Object.keys(body).every((key) => allowedKeys.has(key));
}

function hasAtLeastOneKey(body: Record<string, unknown>): boolean {
  return Object.keys(body).length > 0;
}

function hasOwn(body: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(body, key);
}

function normalizeNullableText(
  value: unknown,
  maxLength: number,
  fieldName: string
): ValidationResult<string | null> {
  if (value === null) {
    return { success: true, value: null };
  }

  if (typeof value !== "string") {
    return { success: false, message: `${fieldName} must be a string or null.` };
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    return { success: true, value: null };
  }

  if (normalized.length > maxLength) {
    return {
      success: false,
      message: `${fieldName} must be ${maxLength} characters or fewer.`
    };
  }

  return { success: true, value: normalized };
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseAccountUpdateBody(
  body: unknown
): ValidationResult<AccountUpdateInput> {
  if (
    !isPlainObject(body) ||
    !hasAtLeastOneKey(body) ||
    !hasOnlyAllowedKeys(body, ACCOUNT_UPDATE_KEYS)
  ) {
    return { success: false, message: "Invalid account update payload." };
  }

  const value: AccountUpdateInput = {};

  if (hasOwn(body, "displayName")) {
    const rawDisplayName = body.displayName;

    if (typeof rawDisplayName !== "string") {
      return { success: false, message: "displayName must be a string." };
    }

    const displayName = rawDisplayName.trim();

    if (displayName.length < 1 || displayName.length > 80) {
      return {
        success: false,
        message: "displayName must be 1-80 characters."
      };
    }

    value.displayName = displayName;
  }

  if (hasOwn(body, "bio")) {
    const bioValidation = normalizeNullableText(body.bio, 280, "bio");

    if (!bioValidation.success) {
      return bioValidation;
    }

    value.bio = bioValidation.value;
  }

  if (hasOwn(body, "avatarUrl")) {
    const avatarUrlValidation = normalizeNullableText(
      body.avatarUrl,
      500,
      "avatarUrl"
    );

    if (!avatarUrlValidation.success) {
      return avatarUrlValidation;
    }

    if (
      avatarUrlValidation.value !== null &&
      !isHttpUrl(avatarUrlValidation.value)
    ) {
      return {
        success: false,
        message: "avatarUrl must be an http or https URL."
      };
    }

    value.avatarUrl = avatarUrlValidation.value;
  }

  return { success: true, value };
}
