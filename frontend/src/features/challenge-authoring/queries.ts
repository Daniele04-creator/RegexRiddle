import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createChallenge,
  type CreateChallengeInput
} from "@/features/challenge-authoring/api";
import { challengeQueryKeys } from "@/features/challenges/queries";

export function useCreateChallengeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateChallengeInput) => createChallenge(input),
    onSuccess: (challenge) => {
      void queryClient.invalidateQueries({ queryKey: challengeQueryKeys.all });
      void queryClient.setQueryData(challengeQueryKeys.detail(challenge.id), challenge);
    }
  });
}
