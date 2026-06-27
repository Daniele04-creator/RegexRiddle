import type { PublicUserDTO } from "@regexriddle/shared";

import { prisma } from "../db/prisma.js";
import { publicUserSelect, toPublicUserDTO } from "../dto/auth-dto.js";
import type { AccountUpdateInput } from "../validation/account-validation.js";

export async function updateCurrentUserAccount(
  userId: string,
  input: AccountUpdateInput
): Promise<PublicUserDTO> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: publicUserSelect
  });

  return toPublicUserDTO(user);
}
