export const APP_NAME = "RegexRiddle";

export const API_HEALTH_PATH = "/health";

export const API_AUTH_PATH = "/api/auth";

export const API_CHALLENGES_PATH = "/api/challenges";

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
  createdAt: string;
}

export interface AuthUserResponseDTO {
  user: PublicUserDTO;
}

export type AuthMeResponseDTO = AuthUserResponseDTO;

export interface AuthSuccessResponseDTO {
  success: true;
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

export interface PublicApiErrorResponse {
  error: string;
  message: string;
}
