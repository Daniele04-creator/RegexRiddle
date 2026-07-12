export const APP_NAME = "RegexRiddle";

export const API_HEALTH_PATH = "/health";

const API_AUTH_PATH = "/api/auth";

export const API_AUTH_LOGIN_PATH = `${API_AUTH_PATH}/login`;

export const API_AUTH_LOGOUT_PATH = `${API_AUTH_PATH}/logout`;

export const API_AUTH_ME_PATH = `${API_AUTH_PATH}/me`;

export const API_AUTH_REGISTER_PATH = `${API_AUTH_PATH}/register`;

export const API_CHALLENGES_PATH = "/api/challenges";

export const API_LEADERBOARD_PATH = "/api/leaderboard";

export const API_SERVICE_NAME = "regexriddle-api";

export const CHALLENGE_CONTROLS_MAX_PER_KIND = 10;
export const CHALLENGE_CONTROLS_MIN_PER_KIND = 1;

export const CHALLENGE_TITLE_MIN_LENGTH = 3;
export const CHALLENGE_TITLE_MAX_LENGTH = 100;
export const CHALLENGE_DESCRIPTION_MIN_LENGTH = 20;
export const CHALLENGE_DESCRIPTION_MAX_LENGTH = 1_000;
export const CHALLENGE_PATTERN_MIN_LENGTH = 1;
export const CHALLENGE_PATTERN_MAX_LENGTH = 300;
export const CHALLENGE_EXAMPLE_MIN_LENGTH = 1;
export const CHALLENGE_EXAMPLE_MAX_LENGTH = 200;

export const AUTH_PASSWORD_MIN_LENGTH = 8;
export const AUTH_PASSWORD_MAX_LENGTH = 128;

const AUTH_PASSWORD_LETTER_PATTERN = /[A-Za-z]/;
const AUTH_PASSWORD_NUMBER_PATTERN = /\d/;

export function hasRequiredPasswordCharacters(value: string): boolean {
  return (
    AUTH_PASSWORD_LETTER_PATTERN.test(value) &&
    AUTH_PASSWORD_NUMBER_PATTERN.test(value)
  );
}

export const USERNAME_PATTERN = /^[a-z0-9_]{3,32}$/;

const AVATAR_DATA_IMAGE_PATTERN =
  /^data:image\/(?:gif|jpeg|png|webp);base64,[a-z0-9+/]+=*$/i;

export function isSupportedAvatarSource(value: string): boolean {
  return AVATAR_DATA_IMAGE_PATTERN.test(value.trim());
}

export type ChallengeDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface HealthResponseDTO {
  status: "ok";
  service: typeof API_SERVICE_NAME;
  appName: typeof APP_NAME;
}

export interface PublicUserDTO {
  id: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
  stats: {
    solvedTotal: number;
    createdTotal: number;
    attemptsTotal: number;
  };
  solvedChallenges: ProfileSolvedChallengeDTO[];
  createdChallenges: ProfileCreatedChallengeDTO[];
}

export interface ProfileSolvedChallengeDTO {
  id: string;
  title: string;
  difficulty: ChallengeDifficulty;
  attemptsUsed: number;
}

export interface ProfileCreatedChallengeDTO {
  id: string;
  title: string;
  difficulty: ChallengeDifficulty;
  solversTotal: number;
}

export interface AuthUserResponseDTO {
  user: PublicUserDTO;
}

export interface AuthSuccessResponseDTO {
  success: true;
}

export interface AccountUpdateRequestDTO {
  username?: string;
  avatarUrl?: string | null;
}

export interface AccountUpdateResponseDTO {
  user: PublicUserDTO;
}

export interface PublicChallengeAuthorDTO {
  username: string;
}

export interface ChallengeListItemDTO {
  id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  author: PublicChallengeAuthorDTO;
  publicPositiveExample: string;
  publicNegativeExample: string;
  createdAt: string;
}

export interface ChallengeListResponseDTO {
  items: ChallengeListItemDTO[];
  total: number;
}

export interface ChallengeViewerStateDTO {
  hasSolved: boolean;
  attemptsUsed: number | null;
}

export interface ChallengeDetailDTO extends ChallengeListItemDTO {
  viewer: ChallengeViewerStateDTO | null;
}

export interface LeaderboardUserDTO {
  username: string;
}

export interface LeaderboardItemDTO {
  rank: number;
  user: LeaderboardUserDTO;
  solvedCount: number;
  averageAttempts: number;
}

export interface LeaderboardResponseDTO {
  items: LeaderboardItemDTO[];
}

export type ChallengeControlKindDTO = "POSITIVE" | "NEGATIVE";

export interface ChallengeCreateControlDTO {
  kind: ChallengeControlKindDTO;
  value: string;
}

export interface ChallengeCreateRequestDTO {
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  secretPattern: string;
  publicPositiveExample: string;
  publicNegativeExample: string;
  controls: ChallengeCreateControlDTO[];
}

export interface AttemptSubmissionRequestDTO {
  pattern: string;
}

export interface AttemptResultDTO {
  id: string;
  attemptNumber: number;
  positiveMatched: number;
  positiveTotal: number;
  negativeMatched: number;
  negativeTotal: number;
  isCorrect: boolean;
}

export interface AttemptSubmissionResponseDTO {
  attempt: AttemptResultDTO;
}

const PUBLIC_API_ERROR_CODES = [
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "INVALID_CREDENTIALS",
  "INVALID_USERNAME",
  "INVALID_PASSWORD",
  "FORBIDDEN",
  "NOT_FOUND",
  "USERNAME_IN_USE",
  "CHALLENGE_ALREADY_SOLVED",
  "AUTHOR_CANNOT_ATTEMPT",
  "INVALID_REGEX",
  "INCOHERENT_CHALLENGE",
  "PAYLOAD_TOO_LARGE",
  "UNSUPPORTED_MEDIA_TYPE",
  "INTERNAL_SERVER_ERROR"
] as const;

export type PublicApiErrorCode = (typeof PUBLIC_API_ERROR_CODES)[number];

export function isPublicApiErrorCode(
  value: unknown
): value is PublicApiErrorCode {
  return (
    typeof value === "string" &&
    (PUBLIC_API_ERROR_CODES as readonly string[]).includes(value)
  );
}

export interface PublicApiErrorResponseDTO {
  code: PublicApiErrorCode;
  error: string;
  message: string;
}
