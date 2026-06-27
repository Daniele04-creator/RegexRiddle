export type SafeRegexErrorCode = "INVALID_FLAGS" | "INVALID_PATTERN";

export class SafeRegexError extends Error {
  readonly code: SafeRegexErrorCode;

  constructor(code: SafeRegexErrorCode, message: string) {
    super(message);
    this.name = "SafeRegexError";
    this.code = code;
  }
}

export function isSafeRegexError(error: unknown): error is SafeRegexError {
  return error instanceof SafeRegexError;
}
