import type { PublicUserDTO } from "@regexriddle/shared";

import { toPublicUserDTO } from "./public-user.dto.js";
import { prismaCurrentUserRepository } from "./current-user.repository.js";
import { hashSessionToken } from "./session.js";

async function deleteSessionIfExpired(session: {
  expiresAt: Date;
  id: string;
}): Promise<boolean> {
  if (session.expiresAt > new Date()) {
    return false;
  }

  await prismaCurrentUserRepository.deleteSessionById(session.id);

  return true;
}

export async function findUserBySessionToken(
  token: string
): Promise<PublicUserDTO | null> {
  const sessionTokenHash = hashSessionToken(token);
  const session =
    await prismaCurrentUserRepository.findSessionUserByHash(sessionTokenHash);

  if (session === null) {
    return null;
  }

  if (await deleteSessionIfExpired(session)) {
    return null;
  }

  return toPublicUserDTO(session.user);
}

export async function findUserIdBySessionToken(
  token: string
): Promise<string | null> {
  const sessionTokenHash = hashSessionToken(token);
  const session =
    await prismaCurrentUserRepository.findSessionUserIdByHash(sessionTokenHash);

  if (session === null) {
    return null;
  }

  if (await deleteSessionIfExpired(session)) {
    return null;
  }

  return session.userId;
}
