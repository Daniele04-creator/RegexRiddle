import {
  isSupportedAvatarSource,
  type AccountUpdateRequestDTO
} from "@regexriddle/shared";
import {
  hasOnlyAllowedKeys,
  isPlainObject,
  type ValidationResult
} from "../../core/validation/validation-utils.js";
import { parseUsername } from "../../core/validation/username.js";

const ACCOUNT_UPDATE_KEYS = new Set(["username", "avatarUrl"]);
const AVATAR_MAX_LENGTH = 350_000;

function parseAvatarUrl(value: unknown): ValidationResult<string | null> {
  if (value === null) {
    return { success: true, value: null };
  }

  if (typeof value !== "string") {
    return {
      success: false,
      message: "avatarUrl must be a string or null."
    };
  }

  const avatarUrl = value.trim();

  if (avatarUrl.length === 0) {
    return { success: true, value: null };
  }

  if (avatarUrl.length > AVATAR_MAX_LENGTH) {
    return {
      success: false,
      message: `avatarUrl must be ${AVATAR_MAX_LENGTH} characters or fewer.`
    };
  }

  if (!isSupportedAvatarSource(avatarUrl)) {
    return {
      success: false,
      message: "avatarUrl must be a supported data image."
    };
  }

  return { success: true, value: avatarUrl };
}

export function parseAccountUpdateBody(
  body: unknown
): ValidationResult<AccountUpdateRequestDTO> {
  if (
    !isPlainObject(body) ||
    Object.keys(body).length === 0 ||
    !hasOnlyAllowedKeys(body, ACCOUNT_UPDATE_KEYS)
  ) {
    return { success: false, message: "Invalid account update payload." };
  }

  const value: AccountUpdateRequestDTO = {};

  if (Object.hasOwn(body, "username")) {
    const validation = parseUsername(body.username);

    if (!validation.success) {
      return validation;
    }

    value.username = validation.value;
  }

  if (Object.hasOwn(body, "avatarUrl")) {
    const validation = parseAvatarUrl(body.avatarUrl);

    if (!validation.success) {
      return validation;
    }

    value.avatarUrl = validation.value;
  }

  return { success: true, value };
}
