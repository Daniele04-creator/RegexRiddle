import {
  API_CHALLENGES_PATH,
  type ChallengeDetailDTO,
  type ChallengeListResponseDTO
} from "@regexriddle/shared";

import { apiGet } from "@/lib/api-client";

export interface ChallengePageParams {
  limit: number;
  page: number;
}

function createChallengePagePath({ limit, page }: ChallengePageParams): string {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  return `${API_CHALLENGES_PATH}?${params.toString()}`;
}

export function getChallenges(
  params: ChallengePageParams,
  signal?: AbortSignal
) {
  return apiGet<ChallengeListResponseDTO>(createChallengePagePath(params), signal);
}

export function getChallengeDetail(id: string, signal?: AbortSignal) {
  return apiGet<ChallengeDetailDTO>(
    `${API_CHALLENGES_PATH}/${encodeURIComponent(id)}`,
    signal
  );
}
