import {
  API_HEALTH_PATH,
  type HealthResponse
} from "@regexriddle/shared";

import { apiGet } from "@/lib/api-client";

export function getHealth(signal?: AbortSignal) {
  return apiGet<HealthResponse>(API_HEALTH_PATH, signal);
}
