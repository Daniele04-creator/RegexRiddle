import type {
  ChallengeControlKindDTO,
  ChallengeCreateRequestDTO,
  ChallengeDifficulty
} from "@regexriddle/shared";

export interface ChallengeListQuery {
  page: number;
  limit: number;
}

export interface ChallengeCreateControlInput {
  kind: ChallengeControlKindDTO;
  value: string;
}

export interface ChallengeCreateInput {
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  secretPattern: string;
  flags: string;
  publicPositiveExample: string;
  publicNegativeExample: string;
  controls: ChallengeCreateControlInput[];
}

interface ValidationSuccess<T> {
  success: true;
  value: T;
}

interface ValidationFailure {
  success: false;
  message: string;
}

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_PAGE = 1_000;
const ALLOWED_LIST_QUERY_KEYS = new Set(["page", "limit"]);
const ALLOWED_CREATE_BODY_KEYS = new Set([
  "title",
  "description",
  "difficulty",
  "secretPattern",
  "flags",
  "publicPositiveExample",
  "publicNegativeExample",
  "controls"
]);
const ALLOWED_CONTROL_KEYS = new Set(["kind", "value"]);
const ALLOWED_DIFFICULTIES = new Set<ChallengeDifficulty>([
  "EASY",
  "MEDIUM",
  "HARD"
]);
const ALLOWED_CONTROL_KINDS = new Set<ChallengeControlKindDTO>([
  "POSITIVE",
  "NEGATIVE"
]);
const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 100;
const MIN_DESCRIPTION_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 1_000;
const MIN_SECRET_PATTERN_LENGTH = 1;
const MAX_SECRET_PATTERN_LENGTH = 300;
const MIN_EXAMPLE_LENGTH = 1;
const MAX_EXAMPLE_LENGTH = 200;
const MIN_CONTROLS_PER_KIND = 3;
const MAX_CONTROLS = 30;

function readSingleQueryValue(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  return value;
}

function parsePositiveInteger(
  value: string | undefined,
  fallback: number
): number | null {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyAllowedKeys(
  body: Record<string, unknown>,
  allowedKeys: Set<string>
): boolean {
  return Object.keys(body).every((key) => allowedKeys.has(key));
}

function readRequiredTrimmedString(
  body: Record<string, unknown>,
  key: string
): string | null {
  const value = body[key];

  if (typeof value !== "string") {
    return null;
  }

  return value.trim();
}

function readRequiredString(
  body: Record<string, unknown>,
  key: string
): string | null {
  const value = body[key];

  if (typeof value !== "string") {
    return null;
  }

  return value;
}

function isStringLengthInRange(
  value: string,
  minLength: number,
  maxLength: number
): boolean {
  return value.length >= minLength && value.length <= maxLength;
}

function parseControl(
  control: unknown
): ValidationResult<ChallengeCreateControlInput> {
  if (!isPlainObject(control) || !hasOnlyAllowedKeys(control, ALLOWED_CONTROL_KEYS)) {
    return { success: false, message: "Invalid challenge control." };
  }

  const kind = control.kind;
  const value = readRequiredString(control, "value");

  if (
    typeof kind !== "string" ||
    !ALLOWED_CONTROL_KINDS.has(kind as ChallengeControlKindDTO)
  ) {
    return { success: false, message: "control kind must be POSITIVE or NEGATIVE." };
  }

  if (
    value === null ||
    !isStringLengthInRange(value, MIN_EXAMPLE_LENGTH, MAX_EXAMPLE_LENGTH)
  ) {
    return {
      success: false,
      message: "control value must be 1-200 characters."
    };
  }

  return {
    success: true,
    value: {
      kind: kind as ChallengeControlKindDTO,
      value
    }
  };
}

function validateControlSets(
  controls: ChallengeCreateControlInput[]
): ValidationResult<ChallengeCreateControlInput[]> {
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
    positiveValues.size < MIN_CONTROLS_PER_KIND ||
    negativeValues.size < MIN_CONTROLS_PER_KIND
  ) {
    return {
      success: false,
      message: "At least 3 POSITIVE and 3 NEGATIVE controls are required."
    };
  }

  return { success: true, value: controls };
}

export function parseChallengeListQuery(
  query: unknown
): ValidationResult<ChallengeListQuery> {
  if (query === null || typeof query !== "object" || Array.isArray(query)) {
    return { success: false, message: "Invalid query parameters." };
  }

  const entries = Object.entries(query);

  for (const [key, value] of entries) {
    if (!ALLOWED_LIST_QUERY_KEYS.has(key) || typeof value !== "string") {
      return { success: false, message: "Unsupported query parameter." };
    }
  }

  const record = query as Record<string, unknown>;
  const page = parsePositiveInteger(
    readSingleQueryValue(record.page),
    DEFAULT_PAGE
  );
  const limit = parsePositiveInteger(
    readSingleQueryValue(record.limit),
    DEFAULT_LIMIT
  );

  if (page === null || page > MAX_PAGE) {
    return { success: false, message: "page must be between 1 and 1000." };
  }

  if (limit === null || limit > MAX_LIMIT) {
    return { success: false, message: "limit must be between 1 and 50." };
  }

  return {
    success: true,
    value: { page, limit }
  };
}

export function parseChallengeId(id: unknown): ValidationResult<string> {
  if (typeof id !== "string" || !UUID_PATTERN.test(id)) {
    return { success: false, message: "id must be a valid UUID." };
  }

  return { success: true, value: id };
}

export function parseCreateChallengeBody(
  body: unknown
): ValidationResult<ChallengeCreateInput> {
  if (!isPlainObject(body) || !hasOnlyAllowedKeys(body, ALLOWED_CREATE_BODY_KEYS)) {
    return { success: false, message: "Invalid challenge creation payload." };
  }

  const payload = body as Partial<ChallengeCreateRequestDTO>;
  const title = readRequiredTrimmedString(body, "title");
  const description = readRequiredTrimmedString(body, "description");
  const secretPattern = readRequiredTrimmedString(body, "secretPattern");
  const publicPositiveExample = readRequiredString(body, "publicPositiveExample");
  const publicNegativeExample = readRequiredString(body, "publicNegativeExample");

  if (
    title === null ||
    !isStringLengthInRange(title, MIN_TITLE_LENGTH, MAX_TITLE_LENGTH)
  ) {
    return { success: false, message: "title must be 3-100 characters." };
  }

  if (
    description === null ||
    !isStringLengthInRange(
      description,
      MIN_DESCRIPTION_LENGTH,
      MAX_DESCRIPTION_LENGTH
    )
  ) {
    return {
      success: false,
      message: "description must be 20-1000 characters."
    };
  }

  if (
    typeof payload.difficulty !== "string" ||
    !ALLOWED_DIFFICULTIES.has(payload.difficulty)
  ) {
    return {
      success: false,
      message: "difficulty must be EASY, MEDIUM, or HARD."
    };
  }

  if (
    secretPattern === null ||
    !isStringLengthInRange(
      secretPattern,
      MIN_SECRET_PATTERN_LENGTH,
      MAX_SECRET_PATTERN_LENGTH
    )
  ) {
    return {
      success: false,
      message: "secretPattern must be 1-300 characters."
    };
  }

  if (payload.flags !== undefined && typeof payload.flags !== "string") {
    return { success: false, message: "flags must be a string." };
  }

  if (
    publicPositiveExample === null ||
    !isStringLengthInRange(
      publicPositiveExample,
      MIN_EXAMPLE_LENGTH,
      MAX_EXAMPLE_LENGTH
    )
  ) {
    return {
      success: false,
      message: "publicPositiveExample must be 1-200 characters."
    };
  }

  if (
    publicNegativeExample === null ||
    !isStringLengthInRange(
      publicNegativeExample,
      MIN_EXAMPLE_LENGTH,
      MAX_EXAMPLE_LENGTH
    )
  ) {
    return {
      success: false,
      message: "publicNegativeExample must be 1-200 characters."
    };
  }

  if (!Array.isArray(payload.controls)) {
    return { success: false, message: "controls must be an array." };
  }

  if (payload.controls.length > MAX_CONTROLS) {
    return { success: false, message: "controls must contain at most 30 items." };
  }

  const controls: ChallengeCreateControlInput[] = [];

  for (const rawControl of payload.controls) {
    const controlValidation = parseControl(rawControl);

    if (!controlValidation.success) {
      return controlValidation;
    }

    controls.push(controlValidation.value);
  }

  const controlSetValidation = validateControlSets(controls);

  if (!controlSetValidation.success) {
    return controlSetValidation;
  }

  return {
    success: true,
    value: {
      title,
      description,
      difficulty: payload.difficulty,
      secretPattern,
      flags: payload.flags ?? "",
      publicPositiveExample,
      publicNegativeExample,
      controls
    }
  };
}
