import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  submitChallengeAttempt,
  type SubmitChallengeAttemptInput
} from "@/features/attempts/api";
import { challengeQueryKeys } from "@/features/challenges/queries";
import { leaderboardQueryKeys } from "@/features/leaderboard/queries";

export function useSubmitAttemptMutation(challengeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitChallengeAttemptInput) =>
      submitChallengeAttempt(challengeId, input),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: challengeQueryKeys.detail(challengeId)
      });
      void queryClient.invalidateQueries({ queryKey: challengeQueryKeys.all });

      if (response.solved) {
        void queryClient.invalidateQueries({ queryKey: leaderboardQueryKeys.all });
      }
    }
  });
}
