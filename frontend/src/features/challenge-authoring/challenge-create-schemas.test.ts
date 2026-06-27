import { describe, expect, it } from "vitest";

import {
  challengeCreateFlagStringSchema,
  challengeCreateFormSchema,
  mapChallengeCreateFormToInput,
  normalizeChallengeCreateFlags,
  type ChallengeCreateFormValues
} from "@/features/challenge-authoring/schemas";

function validValues(
  overrides: Partial<ChallengeCreateFormValues> = {}
): ChallengeCreateFormValues {
  return {
    description: "Create a regex that matches five-digit Italian postal codes.",
    difficulty: "EASY",
    flags: {
      i: true,
      m: true
    },
    negativeControls: [
      { value: "1234" },
      { value: "ABCDE" },
      { value: "123456" }
    ],
    positiveControls: [
      { value: "00100" },
      { value: "20121" },
      { value: "99999" }
    ],
    publicNegativeExample: "8012A",
    publicPositiveExample: "80125",
    pattern: String.raw`[0-9]{5}`,
    title: "CAP italiano",
    ...overrides
  };
}

describe("challenge creation schema", () => {
  it("trims public metadata and maps to the backend creation DTO", () => {
    const parsed = challengeCreateFormSchema.parse(
      validValues({
        description:
          "  Create a regex that matches five-digit Italian postal codes.  ",
        pattern: String.raw`  [0-9]{5}  `,
        title: "  CAP italiano  "
      })
    );

    expect(normalizeChallengeCreateFlags(parsed.flags)).toBe("im");
    expect(mapChallengeCreateFormToInput(parsed)).toEqual({
      controls: [
        { kind: "POSITIVE", value: "00100" },
        { kind: "POSITIVE", value: "20121" },
        { kind: "POSITIVE", value: "99999" },
        { kind: "NEGATIVE", value: "1234" },
        { kind: "NEGATIVE", value: "ABCDE" },
        { kind: "NEGATIVE", value: "123456" }
      ],
      description: "Create a regex that matches five-digit Italian postal codes.",
      difficulty: "EASY",
      flags: "im",
      publicNegativeExample: "8012A",
      publicPositiveExample: "80125",
      secretPattern: String.raw`[0-9]{5}`,
      title: "CAP italiano"
    });
  });

  it("rejects too few and too many controls per kind", () => {
    expect(
      challengeCreateFormSchema.safeParse(
        validValues({
          positiveControls: [{ value: "00100" }, { value: "20121" }]
        })
      ).success
    ).toBe(false);
    expect(
      challengeCreateFormSchema.safeParse(
        validValues({
          negativeControls: Array.from({ length: 11 }, (_, index) => ({
            value: `negative-${index}`
          }))
        })
      ).success
    ).toBe(false);
  });

  it("rejects duplicate and contradictory controls before submitting", () => {
    expect(
      challengeCreateFormSchema.safeParse(
        validValues({
          positiveControls: [
            { value: "00100" },
            { value: "00100" },
            { value: "99999" }
          ]
        })
      ).success
    ).toBe(false);
    expect(
      challengeCreateFormSchema.safeParse(
        validValues({
          negativeControls: [
            { value: "00100" },
            { value: "ABCDE" },
            { value: "123456" }
          ]
        })
      ).success
    ).toBe(false);
  });

  it("normalizes supported flags deterministically and rejects invalid raw flags", () => {
    expect(
      normalizeChallengeCreateFlags({
        i: true,
        m: true
      })
    ).toBe("im");
    expect(challengeCreateFlagStringSchema.safeParse("im").success).toBe(true);
    expect(challengeCreateFlagStringSchema.safeParse("ii").success).toBe(false);
    expect(challengeCreateFlagStringSchema.safeParse("g").success).toBe(false);
  });
});
