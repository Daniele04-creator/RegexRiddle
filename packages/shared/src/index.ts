export const APP_NAME = "RegexRiddle";

export const API_HEALTH_PATH = "/health";

export const API_SERVICE_NAME = "regexriddle-api";

export const WEB_SMOKE_TEXT = "RegexRiddle scaffold is running";

export type HealthStatus = "ok";

export interface HealthResponse {
  status: HealthStatus;
  service: typeof API_SERVICE_NAME;
  appName: typeof APP_NAME;
  environment: string;
}
