import type {
  ChallengeCreateRequestDTO,
  ChallengeViewerStateDTO
} from "@regexriddle/shared";

import { prisma } from "../../core/db/prisma.js";
import type { PublicChallengeRecord } from "./challenge.dto.js";
import type { ChallengeListQuery } from "./challenge-list.validation.js";

const MAX_PUBLIC_CHALLENGES = 100;

const publicChallengeSelect = {
  id: true,
  title: true,
  description: true,
  difficulty: true,
  publicPositiveExample: true,
  publicNegativeExample: true,
  createdAt: true,
  author: {
    select: {
      username: true
    }
  }
} as const;

export const prismaChallengeRepository = {
  createForAuthor(
    authorId: string,
    input: ChallengeCreateRequestDTO
  ): Promise<PublicChallengeRecord> {
    return prisma.challenge.create({
      data: {
        authorId,
        title: input.title,
        description: input.description,
        difficulty: input.difficulty,
        publicPositiveExample: input.publicPositiveExample,
        publicNegativeExample: input.publicNegativeExample,
        controls: {
          create: input.controls.map((control) => ({
            kind: control.kind,
            value: control.value
          }))
        }
      },
      select: publicChallengeSelect
    });
  },

  findPublicDetailById(id: string): Promise<PublicChallengeRecord | null> {
    return prisma.challenge.findUnique({
      where: { id },
      select: publicChallengeSelect
    });
  },

  async findViewerState(
    challengeId: string,
    viewerUserId: string
  ): Promise<ChallengeViewerStateDTO> {
    const solution = await prisma.solution.findUnique({
      where: {
        userId_challengeId: {
          challengeId,
          userId: viewerUserId
        }
      },
      select: { attemptsUsed: true }
    });

    if (solution === null) {
      return {
        attemptsUsed: null,
        hasSolved: false
      };
    }

    return {
      attemptsUsed: solution.attemptsUsed,
      hasSolved: true
    };
  },

  listPublic(query: ChallengeListQuery): Promise<PublicChallengeRecord[]> {
    const where =
      query.difficulty === undefined ? {} : { difficulty: query.difficulty };

    return prisma.challenge.findMany({
      where,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: MAX_PUBLIC_CHALLENGES,
      select: publicChallengeSelect
    });
  }
};
