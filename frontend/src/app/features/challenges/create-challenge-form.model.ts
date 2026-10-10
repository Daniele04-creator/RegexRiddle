import {
  CHALLENGE_DESCRIPTION_MAX_LENGTH,
  CHALLENGE_DESCRIPTION_MIN_LENGTH,
  CHALLENGE_EXAMPLE_MAX_LENGTH,
  CHALLENGE_EXAMPLE_MIN_LENGTH,
  CHALLENGE_PATTERN_MAX_LENGTH,
  CHALLENGE_PATTERN_MIN_LENGTH,
  CHALLENGE_TITLE_MAX_LENGTH,
  CHALLENGE_TITLE_MIN_LENGTH,
  type ChallengeCreateControlDTO,
  type ChallengeCreateRequestDTO,
  type ChallengeDifficulty
} from "@regexriddle/shared";

import {
  MAX_CONTROLS_PER_KIND,
  MIN_CONTROLS_PER_KIND,
  REQUIRED_FIELD_MESSAGE,
  controlFieldKey,
  isBlank
} from "../../shared/app.shared";
import type {
  ControlTone,
  CreateChallengeField
} from "../../shared/app.shared";

export interface CreateChallengeFormState {
  description: string;
  difficulty: ChallengeDifficulty;
  negativeControls: string[];
  negativeExample: string;
  positiveControls: string[];
  positiveExample: string;
  secretPattern: string;
  title: string;
}

interface CreateChallengeValidation {
  fieldErrors: Map<CreateChallengeField, string>;
  formError: string | null;
}

export function createInitialControlValues(): string[] {
  return Array.from({ length: MIN_CONTROLS_PER_KIND }, () => "");
}

export function appendControlValue(values: string[]): string[] {
  return values.length >= MAX_CONTROLS_PER_KIND ? values : [...values, ""];
}

export function removeControlValue(values: string[], index: number): string[] {
  if (values.length <= MIN_CONTROLS_PER_KIND) {
    return values;
  }

  return values.filter((_, itemIndex) => itemIndex !== index);
}

export function replaceControlValue(
  values: string[],
  index: number,
  value: string
): string[] {
  return values.map((item, itemIndex) => (itemIndex === index ? value : item));
}

function collectControlErrors(
  values: string[],
  tone: ControlTone,
  errors: Map<CreateChallengeField, string>
): void {
  for (const [index, value] of values.entries()) {
    const field = controlFieldKey(tone, index);

    if (isBlank(value)) {
      errors.set(field, REQUIRED_FIELD_MESSAGE);
      continue;
    }

    if (
      value.length < CHALLENGE_EXAMPLE_MIN_LENGTH ||
      value.length > CHALLENGE_EXAMPLE_MAX_LENGTH
    ) {
      errors.set(
        field,
        `Usa da ${CHALLENGE_EXAMPLE_MIN_LENGTH} a ${CHALLENGE_EXAMPLE_MAX_LENGTH} caratteri.`
      );
    }
  }
}

function removeControlErrors(
  fieldErrors: Map<CreateChallengeField, string>,
  tone: ControlTone
): Map<CreateChallengeField, string> {
  const next = new Map(fieldErrors);

  for (const field of fieldErrors.keys()) {
    if (field.startsWith(`${tone}Control-`)) {
      next.delete(field);
    }
  }

  return next;
}

export function recalculateControlErrors(
  fieldErrors: Map<CreateChallengeField, string>,
  values: string[],
  tone: ControlTone
): Map<CreateChallengeField, string> {
  const next = removeControlErrors(fieldErrors, tone);

  collectControlErrors(values, tone, next);

  return next;
}

export function clearControlError(
  fieldErrors: Map<CreateChallengeField, string>,
  tone: ControlTone,
  index: number
): Map<CreateChallengeField, string> {
  const next = new Map(fieldErrors);
  next.delete(controlFieldKey(tone, index));

  return next;
}

function validateLength(
  errors: Map<CreateChallengeField, string>,
  field: CreateChallengeField,
  value: string,
  minLength: number,
  maxLength: number
): void {
  if (isBlank(value)) {
    errors.set(field, REQUIRED_FIELD_MESSAGE);
    return;
  }

  if (value.length < minLength || value.length > maxLength) {
    errors.set(field, `Usa da ${minLength} a ${maxLength} caratteri.`);
  }
}

function hasDuplicateControls(state: CreateChallengeFormState): boolean {
  const controls = [
    ...state.positiveControls,
    ...state.negativeControls
  ].filter((value) => !isBlank(value));

  return new Set(controls).size !== controls.length;
}

export function validateCreateChallenge(
  state: CreateChallengeFormState
): CreateChallengeValidation {
  const fieldErrors = new Map<CreateChallengeField, string>();

  validateLength(
    fieldErrors,
    "title",
    state.title.trim(),
    CHALLENGE_TITLE_MIN_LENGTH,
    CHALLENGE_TITLE_MAX_LENGTH
  );
  validateLength(
    fieldErrors,
    "description",
    state.description.trim(),
    CHALLENGE_DESCRIPTION_MIN_LENGTH,
    CHALLENGE_DESCRIPTION_MAX_LENGTH
  );
  validateLength(
    fieldErrors,
    "secretPattern",
    state.secretPattern,
    CHALLENGE_PATTERN_MIN_LENGTH,
    CHALLENGE_PATTERN_MAX_LENGTH
  );
  validateLength(
    fieldErrors,
    "positiveExample",
    state.positiveExample,
    CHALLENGE_EXAMPLE_MIN_LENGTH,
    CHALLENGE_EXAMPLE_MAX_LENGTH
  );
  validateLength(
    fieldErrors,
    "negativeExample",
    state.negativeExample,
    CHALLENGE_EXAMPLE_MIN_LENGTH,
    CHALLENGE_EXAMPLE_MAX_LENGTH
  );
  collectControlErrors(state.positiveControls, "positive", fieldErrors);
  collectControlErrors(state.negativeControls, "negative", fieldErrors);

  return {
    fieldErrors,
    formError: hasDuplicateControls(state)
      ? "Le stringhe di controllo non possono essere duplicate o appartenere a entrambi i gruppi."
      : null
  };
}

export function buildCreateChallengePayload(
  state: CreateChallengeFormState
): ChallengeCreateRequestDTO {
  const positiveControls: ChallengeCreateControlDTO[] = state.positiveControls
    .filter((value) => value.trim() !== "")
    .map((value) => ({ kind: "POSITIVE", value }));
  const negativeControls: ChallengeCreateControlDTO[] = state.negativeControls
    .filter((value) => value.trim() !== "")
    .map((value) => ({ kind: "NEGATIVE", value }));

  return {
    controls: [...positiveControls, ...negativeControls],
    description: state.description,
    difficulty: state.difficulty,
    publicNegativeExample: state.negativeExample,
    publicPositiveExample: state.positiveExample,
    secretPattern: state.secretPattern,
    title: state.title
  };
}
