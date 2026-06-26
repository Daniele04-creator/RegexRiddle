export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  usernameOrEmail: string;
  password: string;
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

const USERNAME_PATTERN = /^[a-z0-9_]{3,32}$/;
const SIMPLE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_LETTER_PATTERN = /[A-Za-z]/;
const HAS_NUMBER_PATTERN = /\d/;
const REGISTER_KEYS = new Set([
  "username",
  "email",
  "password",
  "displayName"
]);
const LOGIN_KEYS = new Set(["usernameOrEmail", "password"]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readRequiredString(
  body: Record<string, unknown>,
  key: string
): string | null {
  const value = body[key];

  if (typeof value !== "string") {
    return null;
  }

  return value;
}

function hasOnlyAllowedKeys(
  body: Record<string, unknown>,
  allowedKeys: Set<string>
): boolean {
  return Object.keys(body).every((key) => allowedKeys.has(key));
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validatePassword(password: string): string | null {
  if (password.length < 8 || password.length > 128) {
    return "password must be between 8 and 128 characters.";
  }

  if (!HAS_LETTER_PATTERN.test(password) || !HAS_NUMBER_PATTERN.test(password)) {
    return "password must include at least one letter and one number.";
  }

  return null;
}

export function parseRegisterBody(
  body: unknown
): ValidationResult<RegisterInput> {
  if (!isPlainObject(body) || !hasOnlyAllowedKeys(body, REGISTER_KEYS)) {
    return { success: false, message: "Invalid register payload." };
  }

  const rawUsername = readRequiredString(body, "username");
  const rawEmail = readRequiredString(body, "email");
  const password = readRequiredString(body, "password");
  const rawDisplayName = readRequiredString(body, "displayName");

  if (
    rawUsername === null ||
    rawEmail === null ||
    password === null ||
    rawDisplayName === null
  ) {
    return { success: false, message: "Invalid register payload." };
  }

  const username = normalizeUsername(rawUsername);
  const email = normalizeEmail(rawEmail);
  const displayName = rawDisplayName.trim();
  const passwordError = validatePassword(password);

  if (!USERNAME_PATTERN.test(username)) {
    return {
      success: false,
      message: "username must be 3-32 lowercase letters, numbers, or underscores."
    };
  }

  if (email.length > 254 || !SIMPLE_EMAIL_PATTERN.test(email)) {
    return { success: false, message: "email must be valid." };
  }

  if (passwordError !== null) {
    return { success: false, message: passwordError };
  }

  if (displayName.length < 1 || displayName.length > 80) {
    return { success: false, message: "displayName must be 1-80 characters." };
  }

  return {
    success: true,
    value: {
      username,
      email,
      password,
      displayName
    }
  };
}

export function parseLoginBody(body: unknown): ValidationResult<LoginInput> {
  if (!isPlainObject(body) || !hasOnlyAllowedKeys(body, LOGIN_KEYS)) {
    return { success: false, message: "Invalid login payload." };
  }

  const rawUsernameOrEmail = readRequiredString(body, "usernameOrEmail");
  const password = readRequiredString(body, "password");

  if (rawUsernameOrEmail === null || password === null) {
    return { success: false, message: "Invalid login payload." };
  }

  const usernameOrEmail = rawUsernameOrEmail.trim().toLowerCase();

  if (usernameOrEmail === "" || usernameOrEmail.length > 254) {
    return { success: false, message: "Invalid login payload." };
  }

  if (password.length < 1 || password.length > 128) {
    return { success: false, message: "Invalid login payload." };
  }

  return {
    success: true,
    value: {
      usernameOrEmail,
      password
    }
  };
}
