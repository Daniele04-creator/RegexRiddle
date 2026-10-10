import assert from "node:assert/strict";
import test from "node:test";

import { compileSafeRegex, isSafeRegexError } from "../src/regex/regex-engine.js";

const fullMatchCases = [
  { pattern: "a|ab", accepted: ["a", "ab"], rejected: ["abc", "ba"] },
  { pattern: "a+?", accepted: ["a", "aaaa"], rejected: ["", "aaaab"] },
  { pattern: "(?U)a+", accepted: ["a", "aaaa"], rejected: ["", "aaaab"] },
  { pattern: "(?i)a|ab", accepted: ["A", "AB"], rejected: ["ABC", "BA"] },
  { pattern: "(?m)^a$", accepted: ["a"], rejected: ["a\n", "a\nb", "b\na"] },
  { pattern: "(?s).+?", accepted: ["a", "a\nb"], rejected: [""] },
  { pattern: "a", accepted: ["a"], rejected: ["a\n", "\na", "ba", "ab"] },
  { pattern: "", accepted: [""], rejected: ["a", "\n"] },
  { pattern: "(?:a|)", accepted: ["", "a"], rejected: ["aa"] },
  { pattern: "\\p{Greek}+?", accepted: ["α", "αβ"], rejected: ["aα", "αa"] },
  { pattern: "😀+?", accepted: ["😀", "😀😀"], rejected: ["😀a", "a😀"] },
  { pattern: "a\\n", accepted: ["a\n"], rejected: ["a", "a\nb"] },
  { pattern: "\\Qab|cd", accepted: ["ab|cd"], rejected: ["ab", "cd", "ab|cde"] },
  { pattern: "\\Qab|cd\\E|ab", accepted: ["ab|cd", "ab"], rejected: ["cd", "abc"] },
  { pattern: "\\\\Qabc", accepted: ["\\Qabc"], rejected: ["abc", "\\Qabcd"] },
  { pattern: "\\Qabc\\\\E", accepted: ["abc\\"], rejected: ["abc", "abc\\E"] },
  { pattern: "\\Q", accepted: [""], rejected: ["\\Q", "a"] }
] as const;

for (const { pattern, accepted, rejected } of fullMatchCases) {
  test(`matches entire input for ${JSON.stringify(pattern)}`, () => {
    const regex = compileSafeRegex(pattern);

    for (const input of accepted) {
      assert.equal(regex.test(input), true, `should accept ${JSON.stringify(input)}`);
      assert.equal(regex.test(input), true, "repeated calls must be stable");
    }

    for (const input of rejected) {
      assert.equal(regex.test(input), false, `should reject ${JSON.stringify(input)}`);
    }
  });
}

for (const pattern of ["[", "(", "a)|(?:b", "(?=a)", "(a)\\1"]) {
  test(`rejects invalid or unsupported syntax ${JSON.stringify(pattern)}`, () => {
    assert.throws(() => compileSafeRegex(pattern), isSafeRegexError);
  });
}

test("recognizes only safe regex compilation errors", () => {
  assert.equal(isSafeRegexError(new Error("unrelated error")), false);
  assert.equal(isSafeRegexError(null), false);
});
