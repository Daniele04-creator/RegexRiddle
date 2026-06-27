import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  type LoginUserInput,
  type RegisterUserInput
} from "@/features/auth/api";

export const authQueryKeys = {
  currentUser: ["auth", "me"] as const
};

export function useCurrentUserQuery() {
  return useQuery({
    queryFn: ({ signal }) => getCurrentUser(signal),
    queryKey: authQueryKeys.currentUser,
    retry: false
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginUserInput) => loginUser(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKeys.currentUser, user);
    }
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterUserInput) => registerUser(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKeys.currentUser, user);
    }
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.currentUser, null);
    }
  });
}
