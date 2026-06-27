import { RE2 } from "re2-wasm";

import { SafeRegexError } from "./regex-errors.js";

export type SupportedRegexFlag = "i" | "m";

export interface CompiledSafeRegex {
  test(input: string): boolean;
}

const SUPPORTED_USER_FLAGS = new Set(["i", "m"]);
const INTERNAL_UNICODE_FLAG = "u";

export function normalizeRegexFlags(flags: string): string {
  const normalizedFlags: string[] = [];
  const seenFlags = new Set<string>();

  for (const flag of flags) {
    if (seenFlags.has(flag)) {
      throw new SafeRegexError("INVALID_FLAGS", "Regex flags are invalid.");
    }

    if (!SUPPORTED_USER_FLAGS.has(flag)) {
      throw new SafeRegexError("INVALID_FLAGS", "Regex flags are invalid.");
    }

    seenFlags.add(flag);
    normalizedFlags.push(flag);
  }

  normalizedFlags.push(INTERNAL_UNICODE_FLAG);

  return normalizedFlags.join("");
}

export function compileSafeRegex(
  pattern: string,
  flags = ""
): CompiledSafeRegex {
  const re2Flags = normalizeRegexFlags(flags);
  // RE2 \A and \z are absolute text anchors, unlike ^ and $ under multiline.
  const fullMatchPattern = String.raw`\A(?:${pattern})\z`;

  try {
    return new RE2(fullMatchPattern, re2Flags);
  } catch {
    throw new SafeRegexError("INVALID_PATTERN", "Regex pattern is invalid.");
  }
}

export function fullMatch(
  pattern: string,
  flags: string,
  input: string
): boolean {
  return compileSafeRegex(pattern, flags).test(input);
}
