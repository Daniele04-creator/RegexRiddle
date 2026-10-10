import { RE2 } from "re2-wasm";

export interface CompiledSafeRegex {
  test(input: string): boolean;
}

class FullMatchRegex implements CompiledSafeRegex {
  constructor(private readonly regex: RE2) {}

  test(input: string): boolean {
    return this.regex.test(input);
  }
}

const INTERNAL_UNICODE_FLAG = "u";

class SafeRegexError extends Error {}

export function isSafeRegexError(error: unknown): boolean {
  return error instanceof SafeRegexError;
}

function closeOpenLiteral(pattern: string): string {
  let quoted = false;

  for (let index = 0; index < pattern.length; index += 1) {
    if (pattern[index] !== "\\") {
      continue;
    }

    const escaped = pattern[index + 1];

    if (quoted) {
      if (escaped === "E") {
        quoted = false;
        index += 1;
      }
    } else {
      quoted = escaped === "Q";
      index += 1;
    }
  }

  // RE2 accepts an unclosed \Q literal up to the end of the original pattern.
  return quoted ? `${pattern}\\E` : pattern;
}

export function compileSafeRegex(pattern: string): CompiledSafeRegex {
  try {
    // Validate the original syntax before adding a group around user input.
    new RE2(pattern, INTERNAL_UNICODE_FLAG);

    // Absolute anchors also constrain alternatives, lazy quantifiers and inline flags.
    return new FullMatchRegex(
      new RE2(`\\A(?:${closeOpenLiteral(pattern)})\\z`, INTERNAL_UNICODE_FLAG)
    );
  } catch {
    throw new SafeRegexError("Regex pattern is invalid.");
  }
}
