import {
  API_AUTH_PATH,
  type AccountUpdateRequestDTO,
  type AccountUpdateResponseDTO,
  type PublicUserDTO
} from "@regexriddle/shared";

import { apiRequest } from "@/lib/api-client";

function pickAllowedAccountFields(
  input: AccountUpdateRequestDTO
): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  if (Object.prototype.hasOwnProperty.call(input, "displayName")) {
    output.displayName = input.displayName;
  }

  if (Object.prototype.hasOwnProperty.call(input, "bio")) {
    output.bio = input.bio ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(input, "avatarUrl")) {
    output.avatarUrl = input.avatarUrl ?? null;
  }

  return output;
}

export async function updateCurrentUser(
  input: AccountUpdateRequestDTO
): Promise<PublicUserDTO> {
  const response = await apiRequest<
    AccountUpdateResponseDTO,
    Record<string, unknown>
  >(`${API_AUTH_PATH}/me`, {
    body: pickAllowedAccountFields(input),
    method: "PATCH",
    protectedMutation: true
  });

  return response.user;
}
