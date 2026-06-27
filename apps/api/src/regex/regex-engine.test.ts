import { describe, expect, it } from "vitest";

import {
  evaluateCandidateAgainstControls,
  verifyChallengeControls,
  type ChallengeControlInput
} from "./attempt-evaluator.js";
import { compileSafeRegex, fullMatch } from "./regex-engine.js";
import { SafeRegexError } from "./regex-errors.js";

function expectSafeRegexError(action: () => unknown): void {
  expect(action).toThrow(SafeRegexError);
}

describe("safe regex engine", () => {
  it("full match accepts a complete digit string", () => {
    expect(fullMatch(String.raw`\d+`, "", "123")).toBe(true);
  });

  it("full match rejects suffix partial matches", () => {
    expect(fullMatch(String.raw`\d+`, "", "123abc")).toBe(false);
  });

  it("full match rejects prefix partial matches", () => {
    expect(fullMatch(String.raw`\d+`, "", "abc123")).toBe(false);
  });

  it("keeps full-string semantics with multiline flag", () => {
    expect(fullMatch(String.raw`\d+`, "m", "abc\n123\ndef")).toBe(false);
  });

  it("supports ignore-case flag", () => {
    expect(fullMatch("abc", "i", "ABC")).toBe(true);
  });

  it("rejects unknown flags", () => {
    expectSafeRegexError(() => compileSafeRegex("abc", "g"));
  });

  it("rejects duplicate flags", () => {
    expectSafeRegexError(() => compileSafeRegex("abc", "ii"));
  });

  it("rejects syntactically invalid patterns", () => {
    expectSafeRegexError(() => compileSafeRegex("(", ""));
  });

  it("rejects lookahead because it is not RE2-compatible", () => {
    expectSafeRegexError(() => compileSafeRegex("abc(?=def)", ""));
  });

  it("rejects backreferences because they are not RE2-compatible", () => {
    expectSafeRegexError(() => compileSafeRegex(String.raw`(cat|dog)\1`, ""));
  });

  it("evaluates a classic ReDoS-shaped pattern without blocking", () => {
    const start = performance.now();
    const result = fullMatch("(a+)+", "", `${"a".repeat(5_000)}!`);
    const elapsedMs = performance.now() - start;

    expect(result).toBe(false);
    expect(elapsedMs).toBeLessThan(1_000);
  });
});

describe("attempt evaluator", () => {
  const controls: ChallengeControlInput[] = [
    { kind: "POSITIVE", value: "123" },
    { kind: "POSITIVE", value: "98765" },
    { kind: "NEGATIVE", value: "abc" },
    { kind: "NEGATIVE", value: "123abc" }
  ];

  it("returns only aggregate counts for candidate evaluation", () => {
    const result = evaluateCandidateAgainstControls(String.raw`\d+`, "", controls);

    expect(result).toEqual({
      positiveMatched: 2,
      positiveTotal: 2,
      negativeMatched: 2,
      negativeTotal: 2,
      isCorrect: true
    });
    expect(Object.keys(result).sort()).toEqual([
      "isCorrect",
      "negativeMatched",
      "negativeTotal",
      "positiveMatched",
      "positiveTotal"
    ]);
  });

  it("does not return control values or patterns", () => {
    const result = evaluateCandidateAgainstControls(String.raw`\d+`, "", controls);
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("123");
    expect(serialized).not.toContain("98765");
    expect(serialized).not.toContain("abc");
    expect(serialized).not.toContain(String.raw`\d+`);
  });

  it("counts negative controls correctly rejected by the candidate", () => {
    const result = evaluateCandidateAgainstControls(
      "[a-z]+",
      "",
      controls
    );

    expect(result.positiveMatched).toBe(0);
    expect(result.negativeMatched).toBe(1);
    expect(result.isCorrect).toBe(false);
  });

  it("detects incoherent challenge controls", () => {
    const result = verifyChallengeControls(String.raw`\d+`, "", [
      ...controls,
      { kind: "POSITIVE", value: "letters" },
      { kind: "NEGATIVE", value: "456" }
    ]);

    expect(result).toEqual({
      isValid: false,
      positiveTotal: 3,
      negativeTotal: 3,
      invalidPositiveCount: 1,
      invalidNegativeCount: 1
    });
  });

  it("accepts coherent challenge controls", () => {
    const result = verifyChallengeControls(String.raw`\d+`, "", controls);

    expect(result).toEqual({
      isValid: true,
      positiveTotal: 2,
      negativeTotal: 2,
      invalidPositiveCount: 0,
      invalidNegativeCount: 0
    });
  });
});
