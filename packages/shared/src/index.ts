export const APP_NAME = "RegexRiddle";

export const API_HEALTH_PATH = "/health";

export const API_AUTH_PATH = "/api/auth";

export const API_CHALLENGES_PATH = "/api/challenges";

export const API_LEADERBOARD_PATH = "/api/leaderboard";

export const API_SERVICE_NAME = "regexriddle-api";

export const WEB_SMOKE_TEXT = "RegexRiddle scaffold is running";

export type HealthStatus = "ok";

export type ChallengeDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface HealthResponse {
  status: HealthStatus;
  service: typeof API_SERVICE_NAME;
  appName: typeof APP_NAME;
  environment: string;
}

export interface PublicUserDTO {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthUserResponseDTO {
  user: PublicUserDTO;
}

export type AuthMeResponseDTO = AuthUserResponseDTO;

export interface AuthSuccessResponseDTO {
  success: true;
}

export interface AccountUpdateRequestDTO {
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface AccountUpdateResponseDTO {
  user: PublicUserDTO;
}

export interface PublicChallengeAuthorDTO {
  username: string;
  displayName: string;
}

export interface PublicChallengeStatsDTO {
  attemptsTotal: number;
  solutionsTotal: number;
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
  stats: PublicChallengeStatsDTO;
}

export interface ChallengeListResponseDTO {
  items: ChallengeListItemDTO[];
  page: number;
  limit: number;
  total: number;
}

export interface ChallengeDetailDTO extends ChallengeListItemDTO {
  updatedAt: string;
}

export interface LeaderboardUserDTO {
  username: string;
  displayName: string;
}

export interface LeaderboardItemDTO {
  rank: number;
  user: LeaderboardUserDTO;
  solvedCount: number;
  averageAttempts: number;
  totalAttemptsUsed: number;
}

export interface LeaderboardResponseDTO {
  items: LeaderboardItemDTO[];
  page: number;
  limit: number;
  total: number;
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
  flags?: string;
  publicPositiveExample: string;
  publicNegativeExample: string;
  controls: ChallengeCreateControlDTO[];
}

export interface AttemptSubmissionRequestDTO {
  pattern: string;
  flags?: string;
}

export interface AttemptResultDTO {
  id: string;
  challengeId: string;
  attemptNumber: number;
  positiveMatched: number;
  positiveTotal: number;
  negativeMatched: number;
  negativeTotal: number;
  isCorrect: boolean;
  createdAt: string;
}

export interface AttemptSubmissionResponseDTO {
  attempt: AttemptResultDTO;
  solved: boolean;
}

export interface PublicApiErrorResponse {
  error: string;
  message: string;
}
