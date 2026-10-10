import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { RE2 } from "re2-wasm";

import { evaluateAttempt, matchesAllControls } from "../src/regex/attempt-evaluator.js";

type Controls = Parameters<typeof matchesAllControls>[1];
type ControlKind = Controls[number]["kind"];

function createControls(firstKind: ControlKind): Controls {
  const positive = Array.from({ length: 10 }, (_, index) => ({
    kind: "POSITIVE" as const,
    value: `p${index}`
  }));
  const negative = Array.from({ length: 10 }, (_, index) => ({
    kind: "NEGATIVE" as const,
    value: `n${index}`
  }));

  return firstKind === "POSITIVE"
    ? [...positive, ...negative]
    : [...negative, ...positive];
}

for (const firstKind of ["POSITIVE", "NEGATIVE"] as const) {
  test(`stops after the first failing ${firstKind.toLowerCase()} control`, () => {
    const controls = createControls(firstKind);
    const regexTest = mock.fn((value: string) =>
      value === controls[0].value
        ? firstKind === "NEGATIVE"
        : value.startsWith("p")
    );

    assert.equal(matchesAllControls({ test: regexTest }, controls), false);
    assert.equal(regexTest.mock.callCount(), 1);
    assert.equal(regexTest.mock.calls[0].arguments[0], controls[0].value);
  });

  test(`checks all valid controls when ${firstKind.toLowerCase()} comes first`, () => {
    const controls = createControls(firstKind);
    const regexTest = mock.fn((value: string) => value.startsWith("p"));

    assert.equal(matchesAllControls({ test: regexTest }, controls), true);
    assert.equal(regexTest.mock.callCount(), 20);
    assert.deepEqual(
      regexTest.mock.calls.map(({ arguments: args }) => args[0]),
      controls.map(({ value }) => value)
    );
  });

  test(`counts every attempt control after an early ${firstKind.toLowerCase()} failure`, () => {
    const controls = createControls(firstKind).map(({ kind, value }) => {
      const shouldMatch = kind === "POSITIVE"
        ? value !== "p0"
        : value === "n0" || value === "n1";

      return { kind, value: shouldMatch ? "a" : "b" };
    });
    const regexTest = mock.method(RE2.prototype, "test");

    try {
      assert.deepEqual(evaluateAttempt("a", controls), {
        positiveMatched: 9,
        positiveTotal: 10,
        negativeMatched: 2,
        negativeTotal: 10,
        isCorrect: false
      });
      assert.equal(regexTest.mock.callCount(), 20);
    } finally {
      regexTest.mock.restore();
    }
  });
}

test("accepts an empty control list without executing the regex", () => {
  const regexTest = mock.fn(() => true);

  assert.equal(matchesAllControls({ test: regexTest }, []), true);
  assert.equal(regexTest.mock.callCount(), 0);
});
