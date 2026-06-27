import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCurrentUser } from "@/features/account/api";
import { authQueryKeys } from "@/features/auth/queries";

export function useUpdateCurrentUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKeys.currentUser, user);
    }
  });
}
