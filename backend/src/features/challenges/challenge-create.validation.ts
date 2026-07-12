import type {
  ChallengeCreateControlDTO,
  ChallengeCreateRequestDTO,
  ChallengeDifficulty
} from "@regexriddle/shared";
import {
  CHALLENGE_CONTROLS_MAX_PER_KIND,
  CHALLENGE_CONTROLS_MIN_PER_KIND,
  CHALLENGE_DESCRIPTION_MAX_LENGTH,
  CHALLENGE_DESCRIPTION_MIN_LENGTH,
  CHALLENGE_EXAMPLE_MAX_LENGTH,
  CHALLENGE_EXAMPLE_MIN_LENGTH,
  CHALLENGE_PATTERN_MAX_LENGTH,
  CHALLENGE_PATTERN_MIN_LENGTH,
  CHALLENGE_TITLE_MAX_LENGTH,
  CHALLENGE_TITLE_MIN_LENGTH
} from "@regexriddle/shared";

import {
  hasOnlyAllowedKeys,
  isPlainObject,
  isStringLengthInRange,
  readRequiredString,
  type ValidationResult
} from "../../core/validation/validation-utils.js";

const ALLOWED_CREATE_BODY_KEYS = new Set([
  "title",
  "description",
  "difficulty",
  "secretPattern",
  "publicPositiveExample",
  "publicNegativeExample",
  "controls"
]);
const ALLOWED_CONTROL_KEYS = new Set(["kind", "value"]);
const MIN_CONTROLS_PER_KIND = CHALLENGE_CONTROLS_MIN_PER_KIND;
const MAX_CONTROLS_PER_KIND = CHALLENGE_CONTROLS_MAX_PER_KIND;
const MAX_CONTROLS = MAX_CONTROLS_PER_KIND * 2;

function isCreateBody(value: unknown): value is Record<string, unknown> {
  return (
    isPlainObject(value) && hasOnlyAllowedKeys(value, ALLOWED_CREATE_BODY_KEYS)
  );
}

function isChallengeDifficulty(value: unknown): value is ChallengeDifficulty {
  return value === "EASY" || value === "MEDIUM" || value === "HARD";
}

function parseControl(
  control: unknown
): ValidationResult<ChallengeCreateControlDTO> {
  if (
    !isPlainObject(control) ||
    !hasOnlyAllowedKeys(control, ALLOWED_CONTROL_KEYS)
  ) {
    return { success: false, message: "Invalid challenge control." };
  }

  const kind = control.kind;
  const value = readRequiredString(control, "value");

  if (kind !== "POSITIVE" && kind !== "NEGATIVE") {
    return {
      success: false,
      message: "control kind must be POSITIVE or NEGATIVE."
    };
  }

  if (
    !isStringLengthInRange(
      value,
      CHALLENGE_EXAMPLE_MIN_LENGTH,
      CHALLENGE_EXAMPLE_MAX_LENGTH
    )
  ) {
    return {
      success: false,
      message: "control value must be 1-200 characters."
    };
  }

  return {
    success: true,
    value: { kind, value }
  };
}

function validateControlSets(
  controls: ChallengeCreateControlDTO[]
): ValidationResult<ChallengeCreateControlDTO[]> {
  const positiveValues = new Set<string>();
  const negativeValues = new Set<string>();

  for (const control of controls) {
    const values =
      control.kind === "POSITIVE" ? positiveValues : negativeValues;

    if (values.has(control.value)) {
      return {
        success: false,
        message: "Duplicate challenge controls are not allowed."
      };
    }

    values.add(control.value);
  }

  for (const value of positiveValues) {
    if (negativeValues.has(value)) {
      return {
        success: false,
        message: "Challenge controls cannot be both POSITIVE and NEGATIVE."
      };
    }
  }

  if (
    positiveValues.size > MAX_CONTROLS_PER_KIND ||
    negativeValues.size > MAX_CONTROLS_PER_KIND
  ) {
    return {
      success: false,
      message: "At most 10 POSITIVE and 10 NEGATIVE controls are allowed."
    };
  }

  if (
    positiveValues.size < MIN_CONTROLS_PER_KIND ||
    negativeValues.size < MIN_CONTROLS_PER_KIND
  ) {
    return {
      success: false,
      message: "At least 1 POSITIVE and 1 NEGATIVE control are required."
    };
  }

  return { success: true, value: controls };
}

function parseCreateControls(
  controlsPayload: unknown
): ValidationResult<ChallengeCreateControlDTO[]> {
  if (!Array.isArray(controlsPayload)) {
    return { success: false, message: "controls must be an array." };
  }

  if (controlsPayload.length > MAX_CONTROLS) {
    return {
      success: false,
      message: "controls must contain at most 20 items."
    };
  }

  const controls: ChallengeCreateControlDTO[] = [];

  for (const rawControl of controlsPayload) {
    const controlValidation = parseControl(rawControl);

    if (!controlValidation.success) {
      return controlValidation;
    }

    controls.push(controlValidation.value);
  }

  return validateControlSets(controls);
}

export function parseCreateChallengeBody(
  body: unknown
): ValidationResult<ChallengeCreateRequestDTO> {
  if (!isCreateBody(body)) {
    return { success: false, message: "Invalid challenge creation payload." };
  }

  const title = readRequiredString(body, "title")?.trim();

  if (
    !isStringLengthInRange(
      title,
      CHALLENGE_TITLE_MIN_LENGTH,
      CHALLENGE_TITLE_MAX_LENGTH
    )
  ) {
    return { success: false, message: "title must be 3-100 characters." };
  }

  const description = readRequiredString(body, "description")?.trim();

  if (
    !isStringLengthInRange(
      description,
      CHALLENGE_DESCRIPTION_MIN_LENGTH,
      CHALLENGE_DESCRIPTION_MAX_LENGTH
    )
  ) {
    return {
      success: false,
      message: "description must be 20-1000 characters."
    };
  }

  const difficulty = body.difficulty;

  if (!isChallengeDifficulty(difficulty)) {
    return {
      success: false,
      message: "difficulty must be EASY, MEDIUM, or HARD."
    };
  }

  const secretPattern = body.secretPattern;

  if (
    !isStringLengthInRange(
      secretPattern,
      CHALLENGE_PATTERN_MIN_LENGTH,
      CHALLENGE_PATTERN_MAX_LENGTH
    )
  ) {
    return {
      success: false,
      message: "secretPattern must be 1-300 characters."
    };
  }

  const publicPositiveExample = body.publicPositiveExample;

  if (
    !isStringLengthInRange(
      publicPositiveExample,
      CHALLENGE_EXAMPLE_MIN_LENGTH,
      CHALLENGE_EXAMPLE_MAX_LENGTH
    )
  ) {
    return {
      success: false,
      message: "publicPositiveExample must be 1-200 characters."
    };
  }

  const publicNegativeExample = body.publicNegativeExample;

  if (
    !isStringLengthInRange(
      publicNegativeExample,
      CHALLENGE_EXAMPLE_MIN_LENGTH,
      CHALLENGE_EXAMPLE_MAX_LENGTH
    )
  ) {
    return {
      success: false,
      message: "publicNegativeExample must be 1-200 characters."
    };
  }

  const controlsValidation = parseCreateControls(body.controls);

  if (!controlsValidation.success) {
    return controlsValidation;
  }

  return {
    success: true,
    value: {
      title,
      description,
      difficulty,
      secretPattern,
      publicPositiveExample,
      publicNegativeExample,
      controls: controlsValidation.value
    }
  };
}
