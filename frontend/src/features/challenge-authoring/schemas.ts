import type { ChallengeCreateRequestDTO, ChallengeDifficulty } from "@regexriddle/shared";
import { z } from "zod";

const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 100;
const MIN_DESCRIPTION_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_SECRET_PATTERN_LENGTH = 300;
const MIN_EXAMPLE_LENGTH = 1;
const MAX_EXAMPLE_LENGTH = 200;
const MIN_CONTROLS_PER_KIND = 3;
export const MAX_CONTROLS_PER_KIND = 10;

const supportedCreateFlags = ["i", "m"] as const;
const supportedCreateFlagSet = new Set<string>(supportedCreateFlags);
const challengeDifficulties = ["EASY", "MEDIUM", "HARD"] as const;

const createControlSchema = z
  .object({
    value: z
      .string()
      .min(MIN_EXAMPLE_LENGTH, "Inserisci un controllo.")
      .max(
        MAX_EXAMPLE_LENGTH,
        `Ogni controllo deve avere al massimo ${MAX_EXAMPLE_LENGTH} caratteri.`
      )
  })
  .strict();

export const challengeCreateFlagStringSchema = z
  .string()
  .max(2, "Sono supportati solo i flag i e m.")
  .refine((flags) => {
    const seen = new Set<string>();

    for (const flag of flags) {
      if (!supportedCreateFlagSet.has(flag) || seen.has(flag)) {
        return false;
      }

      seen.add(flag);
    }

    return true;
  }, "Sono supportati solo i flag i e m, senza duplicati.");

export const challengeCreateFormSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(
        MIN_DESCRIPTION_LENGTH,
        `La descrizione deve avere almeno ${MIN_DESCRIPTION_LENGTH} caratteri.`
      )
      .max(
        MAX_DESCRIPTION_LENGTH,
        `La descrizione deve avere al massimo ${MAX_DESCRIPTION_LENGTH} caratteri.`
      ),
    difficulty: z.enum(challengeDifficulties),
    flags: z
      .object({
        i: z.boolean(),
        m: z.boolean()
      })
      .strict(),
    negativeControls: z
      .array(createControlSchema)
      .min(
        MIN_CONTROLS_PER_KIND,
        `Servono almeno ${MIN_CONTROLS_PER_KIND} controlli negativi.`
      )
      .max(
        MAX_CONTROLS_PER_KIND,
        `Puoi inserire al massimo ${MAX_CONTROLS_PER_KIND} controlli negativi.`
      ),
    positiveControls: z
      .array(createControlSchema)
      .min(
        MIN_CONTROLS_PER_KIND,
        `Servono almeno ${MIN_CONTROLS_PER_KIND} controlli positivi.`
      )
      .max(
        MAX_CONTROLS_PER_KIND,
        `Puoi inserire al massimo ${MAX_CONTROLS_PER_KIND} controlli positivi.`
      ),
    publicNegativeExample: z
      .string()
      .min(MIN_EXAMPLE_LENGTH, "Inserisci un esempio pubblico negativo.")
      .max(
        MAX_EXAMPLE_LENGTH,
        `L'esempio pubblico negativo deve avere al massimo ${MAX_EXAMPLE_LENGTH} caratteri.`
      ),
    publicPositiveExample: z
      .string()
      .min(MIN_EXAMPLE_LENGTH, "Inserisci un esempio pubblico positivo.")
      .max(
        MAX_EXAMPLE_LENGTH,
        `L'esempio pubblico positivo deve avere al massimo ${MAX_EXAMPLE_LENGTH} caratteri.`
      ),
    pattern: z
      .string()
      .trim()
      .min(1, "Inserisci la regex segreta.")
      .max(
        MAX_SECRET_PATTERN_LENGTH,
        `La regex segreta deve avere al massimo ${MAX_SECRET_PATTERN_LENGTH} caratteri.`
      ),
    title: z
      .string()
      .trim()
      .min(MIN_TITLE_LENGTH, `Il titolo deve avere almeno ${MIN_TITLE_LENGTH} caratteri.`)
      .max(
        MAX_TITLE_LENGTH,
        `Il titolo deve avere al massimo ${MAX_TITLE_LENGTH} caratteri.`
      )
  })
  .strict()
  .superRefine((values, context) => {
    addDuplicateControlIssues(context, values.positiveControls, "positiveControls");
    addDuplicateControlIssues(context, values.negativeControls, "negativeControls");
    addContradictoryControlIssues(context, values);
    addPublicExampleIssues(context, values);
    addFlagIssues(context, values.flags);
  });

export type ChallengeCreateFormValues = z.infer<typeof challengeCreateFormSchema>;

export type ChallengeCreateInput = ChallengeCreateRequestDTO;

export const defaultChallengeCreateFormValues: ChallengeCreateFormValues = {
  description: "",
  difficulty: "EASY",
  flags: {
    i: false,
    m: false
  },
  negativeControls: [{ value: "" }, { value: "" }, { value: "" }],
  positiveControls: [{ value: "" }, { value: "" }, { value: "" }],
  publicNegativeExample: "",
  publicPositiveExample: "",
  pattern: "",
  title: ""
};

function addDuplicateControlIssues(
  context: z.RefinementCtx,
  controls: Array<{ value: string }>,
  path: "positiveControls" | "negativeControls"
): void {
  const seen = new Map<string, number>();

  controls.forEach((control, index) => {
    const firstIndex = seen.get(control.value);

    if (firstIndex !== undefined) {
      context.addIssue({
        code: "custom",
        message: "I controlli dello stesso tipo non possono essere duplicati.",
        path: [path, index, "value"]
      });
      context.addIssue({
        code: "custom",
        message: "I controlli dello stesso tipo non possono essere duplicati.",
        path: [path, firstIndex, "value"]
      });
      return;
    }

    seen.set(control.value, index);
  });
}

function addContradictoryControlIssues(
  context: z.RefinementCtx,
  values: Pick<ChallengeCreateFormValues, "negativeControls" | "positiveControls">
): void {
  const negativeValues = new Map(
    values.negativeControls.map((control, index) => [control.value, index])
  );

  values.positiveControls.forEach((control, positiveIndex) => {
    const negativeIndex = negativeValues.get(control.value);

    if (negativeIndex === undefined) {
      return;
    }

    const message = "Lo stesso valore non puo essere positivo e negativo.";

    context.addIssue({
      code: "custom",
      message,
      path: ["positiveControls", positiveIndex, "value"]
    });
    context.addIssue({
      code: "custom",
      message,
      path: ["negativeControls", negativeIndex, "value"]
    });
  });
}

function addPublicExampleIssues(
  context: z.RefinementCtx,
  values: Pick<
    ChallengeCreateFormValues,
    "publicNegativeExample" | "publicPositiveExample"
  >
): void {
  if (
    values.publicPositiveExample.length > 0 &&
    values.publicPositiveExample === values.publicNegativeExample
  ) {
    const message = "Gli esempi pubblici positivo e negativo devono essere diversi.";

    context.addIssue({
      code: "custom",
      message,
      path: ["publicPositiveExample"]
    });
    context.addIssue({
      code: "custom",
      message,
      path: ["publicNegativeExample"]
    });
  }
}

function addFlagIssues(
  context: z.RefinementCtx,
  flags: ChallengeCreateFormValues["flags"]
): void {
  const normalized = normalizeChallengeCreateFlags(flags);
  const result = challengeCreateFlagStringSchema.safeParse(normalized);

  if (!result.success) {
    context.addIssue({
      code: "custom",
      message: "Sono supportati solo i flag i e m, senza duplicati.",
      path: ["flags"]
    });
  }
}

export function normalizeChallengeCreateFlags(
  flags: ChallengeCreateFormValues["flags"]
): string {
  return supportedCreateFlags.filter((flag) => flags[flag]).join("");
}

function mapControls(
  kind: "POSITIVE" | "NEGATIVE",
  controls: Array<{ value: string }>
): ChallengeCreateRequestDTO["controls"] {
  return controls.map((control) => ({
    kind,
    value: control.value
  }));
}

export function mapChallengeCreateFormToInput(
  values: ChallengeCreateFormValues
): ChallengeCreateInput {
  return {
    controls: [
      ...mapControls("POSITIVE", values.positiveControls),
      ...mapControls("NEGATIVE", values.negativeControls)
    ],
    description: values.description,
    difficulty: values.difficulty as ChallengeDifficulty,
    flags: normalizeChallengeCreateFlags(values.flags),
    publicNegativeExample: values.publicNegativeExample,
    publicPositiveExample: values.publicPositiveExample,
    secretPattern: values.pattern,
    title: values.title
  };
}
