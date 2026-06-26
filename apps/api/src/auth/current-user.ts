import type { PublicUserDTO } from "@regexriddle/shared";

import { prisma } from "../db/prisma.js";
import { publicUserSelect, toPublicUserDTO } from "../dto/auth-dto.js";
import { hashSessionToken } from "./session.js";

export async function getCurrentUserFromSessionToken(
  token: string
): Promise<PublicUserDTO | null> {
  const sessionTokenHash = hashSessionToken(token);
  const session = await prisma.session.findUnique({
    where: { sessionTokenHash },
    select: {
      id: true,
      expiresAt: true,
      user: {
        select: publicUserSelect
      }
    }
  });

  if (session === null) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: { id: session.id }
    });

    return null;
  }

  return toPublicUserDTO(session.user);
}
