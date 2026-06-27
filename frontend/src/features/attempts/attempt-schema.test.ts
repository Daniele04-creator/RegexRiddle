import { describe, expect, it } from "vitest";

import {
  attemptFlagStringSchema,
  attemptFormSchema,
  mapAttemptFormToInput
} from "@/features/attempts/schemas";

describe("attempt form schema", () => {
  it("rejects empty and too-long candidate patterns", () => {
    expect(
      attemptFormSchema.safeParse({
        pattern: "   ",
        flags: { i: false, m: false }
      }).success
    ).toBe(false);
    expect(
      attemptFormSchema.safeParse({
        pattern: "x".repeat(257),
        flags: { i: false, m: false }
      }).success
    ).toBe(false);
  });

  it("preserves the submitted pattern and maps supported flags in backend order", () => {
    const result = attemptFormSchema.parse({
      pattern: String.raw` [A-Z]{2}-\d{4} `,
      flags: { i: true, m: true }
    });

    expect(mapAttemptFormToInput(result)).toEqual({
      pattern: String.raw` [A-Z]{2}-\d{4} `,
      flags: "im"
    });
  });

  it("accepts i, m, and im flags while rejecting unsupported or duplicated flags", () => {
    expect(attemptFlagStringSchema.safeParse("").success).toBe(true);
    expect(attemptFlagStringSchema.safeParse("i").success).toBe(true);
    expect(attemptFlagStringSchema.safeParse("m").success).toBe(true);
    expect(attemptFlagStringSchema.safeParse("im").success).toBe(true);
    expect(attemptFlagStringSchema.safeParse("ii").success).toBe(false);
    expect(attemptFlagStringSchema.safeParse("g").success).toBe(false);
  });
});
