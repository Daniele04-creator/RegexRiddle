import { prisma } from "../../core/db/prisma.js";
import { isPrismaErrorCode } from "../../core/db/prisma-errors.js";
import {
  publicUserSelect,
  type PublicUserRecord
} from "../../core/auth/public-user.dto.js";

type LoginUserRecord = PublicUserRecord & {
  passwordHash: string;
};

export const prismaAuthRepository = {
  async createSession(
    userId: string,
    sessionTokenHash: string,
    expiresAt: Date
  ): Promise<void> {
    await prisma.session.create({
      data: {
        userId,
        sessionTokenHash,
        expiresAt
      }
    });
  },

  async createUser(input: {
    passwordHash: string;
    username: string;
  }): Promise<boolean> {
    try {
      await prisma.user.create({
        data: input,
        select: { id: true }
      });

      return true;
    } catch (error) {
      if (isPrismaErrorCode(error, "P2002")) {
        return false;
      }

      throw error;
    }
  },

  async deleteSessionByHash(sessionTokenHash: string): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        sessionTokenHash
      }
    });
  },

  findLoginUser(username: string): Promise<LoginUserRecord | null> {
    return prisma.user.findUnique({
      where: { username },
      select: {
        ...publicUserSelect,
        passwordHash: true
      }
    });
  }
};
