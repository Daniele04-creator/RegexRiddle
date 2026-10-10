import type {
  AccountUpdateRequestDTO,
  PublicUserDTO
} from "@regexriddle/shared";

import { toPublicUserDTO } from "../../core/auth/public-user.dto.js";
import { updateCurrentUserAccountRecord } from "./account.repository.js";

export async function updateCurrentUserAccount(
  userId: string,
  input: AccountUpdateRequestDTO
): Promise<PublicUserDTO | null> {
  const user = await updateCurrentUserAccountRecord(userId, input);

  if (user === null) {
    return null;
  }

  return toPublicUserDTO(user);
}
