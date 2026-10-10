import { prisma } from "../../core/db/prisma.js";
import { isPrismaErrorCode } from "../../core/db/prisma-errors.js";
import {
  publicUserSelect,
  type PublicUserRecord
} from "../../core/auth/public-user.dto.js";
import type { AccountUpdateRequestDTO } from "@regexriddle/shared";

export async function updateCurrentUserAccountRecord(
  userId: string,
  input: AccountUpdateRequestDTO
): Promise<PublicUserRecord | null> {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: input,
      select: publicUserSelect
    });
  } catch (error) {
    if (isPrismaErrorCode(error, "P2002")) {
      return null;
    }

    throw error;
  }
}
