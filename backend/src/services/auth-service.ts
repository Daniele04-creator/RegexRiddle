import argon2 from "argon2";

import type { PublicUserDTO } from "@regexriddle/shared";

import {
  createSessionToken,
  getSessionExpiresAt,
  hashSessionToken
} from "../auth/session.js";
import { prisma } from "../db/prisma.js";
import { publicUserSelect, toPublicUserDTO } from "../dto/auth-dto.js";
import type {
  LoginInput,
  RegisterInput
} from "../validation/auth-validation.js";

interface AuthSessionPayload {
  user: PublicUserDTO;
  sessionToken: string;
  expiresAt: Date;
}

export type RegisterResult =
  | ({ status: "created" } & AuthSessionPayload)
  | { status: "conflict" };

export type LoginResult =
  | ({ status: "authenticated" } & AuthSessionPayload)
  | { status: "invalid_credentials" };

const PASSWORD_HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
  hashLength: 32
} as const;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

async function createSessionForUser(
  userId: string
): Promise<{ sessionToken: string; expiresAt: Date }> {
  const sessionToken = createSessionToken();
  const sessionTokenHash = hashSessionToken(sessionToken);
  const expiresAt = getSessionExpiresAt();

  await prisma.session.create({
    data: {
      userId,
      sessionTokenHash,
      expiresAt
    }
  });

  return { sessionToken, expiresAt };
}

export async function registerUser(
  input: RegisterInput
): Promise<RegisterResult> {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username: input.username }, { email: input.email }]
    },
    select: { id: true }
  });

  if (existingUser !== null) {
    return { status: "conflict" };
  }

  const passwordHash = await argon2.hash(input.password, PASSWORD_HASH_OPTIONS);
  const sessionToken = createSessionToken();
  const sessionTokenHash = hashSessionToken(sessionToken);
  const expiresAt = getSessionExpiresAt();

  try {
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          username: input.username,
          email: input.email,
          passwordHash,
          displayName: input.displayName
        },
        select: publicUserSelect
      });

      await tx.session.create({
        data: {
          userId: createdUser.id,
          sessionTokenHash,
          expiresAt
        }
      });

      return createdUser;
    });

    return {
      status: "created",
      user: toPublicUserDTO(user),
      sessionToken,
      expiresAt
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "conflict" };
    }

    throw error;
  }
}

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: input.usernameOrEmail },
        { email: input.usernameOrEmail }
      ]
    },
    select: {
      ...publicUserSelect,
      passwordHash: true
    }
  });

  if (user === null) {
    return { status: "invalid_credentials" };
  }

  const passwordMatches = await argon2.verify(user.passwordHash, input.password);

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

export async function logoutSession(sessionToken: string | null): Promise<void> {
  if (sessionToken === null) {
    return;
  }

  await prisma.session.deleteMany({
    where: {
      sessionTokenHash: hashSessionToken(sessionToken)
    }
  });
}
