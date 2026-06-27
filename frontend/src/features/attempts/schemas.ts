import { z } from "zod";

const MAX_PATTERN_LENGTH = 256;
const supportedAttemptFlags = ["i", "m"] as const;
const supportedAttemptFlagSet = new Set<string>(supportedAttemptFlags);

export const attemptFlagStringSchema = z
  .string()
  .max(2, "Sono supportati solo i flag i e m.")
  .refine((flags) => {
    const seen = new Set<string>();

    for (const flag of flags) {
      if (!supportedAttemptFlagSet.has(flag) || seen.has(flag)) {
        return false;
      }

      seen.add(flag);
    }

    return true;
  }, "Sono supportati solo i flag i e m, senza duplicati.");

export const attemptFormSchema = z
  .object({
    flags: z
      .object({
        i: z.boolean(),
        m: z.boolean()
      })
      .strict(),
    pattern: z
      .string()
      .max(
        MAX_PATTERN_LENGTH,
        `La regex candidata deve avere al massimo ${MAX_PATTERN_LENGTH} caratteri.`
      )
      .refine(
        (value) => value.trim().length > 0,
        "Inserisci una regex candidata."
      )
  })
  .strict();

export type AttemptFormValues = z.infer<typeof attemptFormSchema>;

export const defaultAttemptFormValues: AttemptFormValues = {
  flags: {
    i: false,
    m: false
  },
  pattern: ""
};

export function normalizeAttemptFlags(flags: AttemptFormValues["flags"]): string {
  return supportedAttemptFlags.filter((flag) => flags[flag]).join("");
}

export function mapAttemptFormToInput(values: AttemptFormValues) {
  return {
    pattern: values.pattern,
    flags: normalizeAttemptFlags(values.flags)
  };
}
