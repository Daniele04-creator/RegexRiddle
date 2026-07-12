import { prisma } from "../db/prisma.js";
import { publicUserSelect } from "./public-user.dto.js";

export const prismaCurrentUserRepository = {
  async deleteSessionById(sessionId: string) {
    await prisma.session.deleteMany({
      where: { id: sessionId }
    });
  },

  findSessionUserByHash(sessionTokenHash: string) {
    return prisma.session.findUnique({
      where: { sessionTokenHash },
      select: {
        id: true,
        expiresAt: true,
        user: {
          select: publicUserSelect
        }
      }
    });
  },

  findSessionUserIdByHash(sessionTokenHash: string) {
    return prisma.session.findUnique({
      where: { sessionTokenHash },
      select: {
        id: true,
        expiresAt: true,
        userId: true
      }
    });
  }
};
