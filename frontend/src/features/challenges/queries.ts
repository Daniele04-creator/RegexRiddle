import { useQuery } from "@tanstack/react-query";

import {
  getChallengeDetail,
  getChallenges,
  type ChallengePageParams
} from "@/features/challenges/api";

export const challengeQueryKeys = {
  all: ["challenges"] as const,
  detail: (id: string) => [...challengeQueryKeys.all, "detail", id] as const,
  list: (params: ChallengePageParams) =>
    [...challengeQueryKeys.all, "list", params.page, params.limit] as const
};

export function useChallengesQuery(params: ChallengePageParams) {
  return useQuery({
    queryFn: ({ signal }) => getChallenges(params, signal),
    queryKey: challengeQueryKeys.list(params)
  });
}

export function useChallengeDetailQuery(id: string) {
  return useQuery({
    enabled: id.length > 0,
    queryFn: ({ signal }) => getChallengeDetail(id, signal),
    queryKey: challengeQueryKeys.detail(id)
  });
}
