import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  hasRequiredPasswordCharacters
} from "@regexriddle/shared";

import {
  hasOnlyAllowedKeys,
  isPlainObject,
  type ValidationResult
} from "../../core/validation/validation-utils.js";
import { parseUsername } from "../../core/validation/username.js";

export interface AuthCredentialsInput {
  username: string;
  password: string;
}

const AUTH_BODY_KEYS = new Set(["username", "password"]);

function validatePassword(password: string): string | null {
  if (
    password.length < AUTH_PASSWORD_MIN_LENGTH ||
    password.length > AUTH_PASSWORD_MAX_LENGTH
  ) {
    return `password must be between ${AUTH_PASSWORD_MIN_LENGTH} and ${AUTH_PASSWORD_MAX_LENGTH} characters.`;
  }

  if (!hasRequiredPasswordCharacters(password)) {
    return "password must include at least one letter and one number.";
  }

  return null;
}

export function parseRegisterBody(
  body: unknown
): ValidationResult<AuthCredentialsInput> {
  if (!isPlainObject(body) || !hasOnlyAllowedKeys(body, AUTH_BODY_KEYS)) {
    return { success: false, message: "Invalid register payload." };
  }

  const password = body.password;

  if (typeof password !== "string") {
    return { success: false, message: "Invalid register payload." };
  }

  const usernameValidation = parseUsername(body.username);

  if (!usernameValidation.success) {
    return usernameValidation;
  }

  const username = usernameValidation.value;
  const passwordError = validatePassword(password);

  if (passwordError !== null) {
    return {
      success: false,
      code: "INVALID_PASSWORD",
      message: passwordError
    };
  }

  return {
    success: true,
    value: {
      username,
      password
    }
  };
}

export function parseLoginBody(
  body: unknown
): ValidationResult<AuthCredentialsInput> {
  if (!isPlainObject(body) || !hasOnlyAllowedKeys(body, AUTH_BODY_KEYS)) {
    return { success: false, message: "Invalid login payload." };
  }

  const password = body.password;

  if (typeof password !== "string") {
    return { success: false, message: "Invalid login payload." };
  }

  const usernameValidation = parseUsername(body.username);

  if (!usernameValidation.success) {
    return { success: false, message: "Invalid login payload." };
  }

  const username = usernameValidation.value;

  if (password.length < 1 || password.length > AUTH_PASSWORD_MAX_LENGTH) {
    return { success: false, message: "Invalid login payload." };
  }

  return {
    success: true,
    value: {
      username,
      password
    }
  };
}
