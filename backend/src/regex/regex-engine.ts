import { RE2 } from "re2-wasm";

export interface CompiledSafeRegex {
  test(input: string): boolean;
}

class FullMatchRegex implements CompiledSafeRegex {
  constructor(private readonly regex: RE2) {}

  test(input: string): boolean {
    const match = this.regex.exec(input);
    const matchedText = match?.[0];

    return (
      match !== null &&
      match.index === 0 &&
      matchedText?.length === input.length
    );
  }
}

const INTERNAL_UNICODE_FLAG = "u";

class SafeRegexError extends Error {}

export function isSafeRegexError(error: unknown): boolean {
  return error instanceof SafeRegexError;
}

export function compileSafeRegex(pattern: string): CompiledSafeRegex {
  try {
    return new FullMatchRegex(new RE2(pattern, INTERNAL_UNICODE_FLAG));
  } catch {
    throw new SafeRegexError("Regex pattern is invalid.");
  }
}
