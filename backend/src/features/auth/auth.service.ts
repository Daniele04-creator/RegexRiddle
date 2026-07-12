import argon2 from "argon2";

import type { PublicUserDTO } from "@regexriddle/shared";

import {
  createSessionToken,
  getSessionExpiresAt,
  hashSessionToken
} from "../../core/auth/session.js";
import { toPublicUserDTO } from "../../core/auth/public-user.dto.js";
import { prismaAuthRepository } from "./auth.repository.js";
import type { AuthCredentialsInput } from "./auth.validation.js";

type LoginResult =
  | {
      status: "authenticated";
      user: PublicUserDTO;
      sessionToken: string;
      expiresAt: Date;
    }
  | { status: "invalid_credentials" };

const PASSWORD_HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
  hashLength: 32
} as const;

async function verifyPassword(
  passwordHash: string,
  password: string
): Promise<boolean> {
  try {
    return await argon2.verify(passwordHash, password);
  } catch {
    return false;
  }
}

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, PASSWORD_HASH_OPTIONS);
}

async function createSessionForUser(
  userId: string
): Promise<{ sessionToken: string; expiresAt: Date }> {
  const sessionToken = createSessionToken();
  const sessionTokenHash = hashSessionToken(sessionToken);
  const expiresAt = getSessionExpiresAt();

  await prismaAuthRepository.createSession(userId, sessionTokenHash, expiresAt);

  return { sessionToken, expiresAt };
}

export async function registerUser(
  input: AuthCredentialsInput
): Promise<"created" | "username_in_use"> {
  const passwordHash = await hashPassword(input.password);

  const created = await prismaAuthRepository.createUser({
    username: input.username,
    passwordHash
  });

  return created ? "created" : "username_in_use";
}

export async function loginUser(
  input: AuthCredentialsInput
): Promise<LoginResult> {
  const user = await prismaAuthRepository.findLoginUser(input.username);

  if (user === null) {
    return { status: "invalid_credentials" };
  }

  const passwordMatches = await verifyPassword(
    user.passwordHash,
    input.password
  );

  if (!passwordMatches) {
    return { status: "invalid_credentials" };
  }

  const session = await createSessionForUser(user.id);

  return {
    status: "authenticated",
    user: toPublicUserDTO(user),
    ...session
  };
}

export async function logoutSession(
  sessionToken: string | null
): Promise<void> {
  if (sessionToken === null) {
    return;
  }

  await prismaAuthRepository.deleteSessionByHash(
    hashSessionToken(sessionToken)
  );
}
