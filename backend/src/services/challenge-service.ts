import type {
  ChallengeDetailDTO,
  ChallengeListResponseDTO
} from "@regexriddle/shared";

import { prisma } from "../db/prisma.js";
import {
  toChallengeDetailDTO,
  toChallengeListItemDTO
} from "../dto/challenge-dto.js";
import { isSafeRegexError } from "../regex/regex-errors.js";
import {
  compileSafeRegex,
  type CompiledSafeRegex
} from "../regex/regex-engine.js";
import type {
  ChallengeCreateInput,
  ChallengeListQuery
} from "../validation/challenge-validation.js";

export type CreateChallengeResult =
  | { status: "created"; challenge: ChallengeDetailDTO }
  | { status: "invalid_regex" }
  | { status: "incoherent_examples" }
  | { status: "incoherent_controls" };

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
      username: true,
      displayName: true
    }
  },
  _count: {
    select: {
      attempts: true,
      solutions: true
    }
  }
} as const;

const publicChallengeDetailSelect = {
  ...publicChallengeSelect,
  updatedAt: true
} as const;

function validateChallengeCoherence(input: ChallengeCreateInput): Exclude<
  CreateChallengeResult["status"],
  "created"
> | null {
  let regex: CompiledSafeRegex;

  try {
    regex = compileSafeRegex(input.secretPattern, input.flags);
  } catch (error) {
    if (isSafeRegexError(error)) {
      return "invalid_regex";
    }

    throw error;
  }

  if (
    !regex.test(input.publicPositiveExample) ||
    regex.test(input.publicNegativeExample)
  ) {
    return "incoherent_examples";
  }

  for (const control of input.controls) {
    const matched = regex.test(control.value);

    if (control.kind === "POSITIVE" && !matched) {
      return "incoherent_controls";
    }

    if (control.kind === "NEGATIVE" && matched) {
      return "incoherent_controls";
    }
  }

  return null;
}

export async function listPublicChallenges(
  query: ChallengeListQuery
): Promise<ChallengeListResponseDTO> {
  const skip = (query.page - 1) * query.limit;

  const [total, challenges] = await prisma.$transaction([
    prisma.challenge.count(),
    prisma.challenge.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip,
      take: query.limit,
      select: publicChallengeSelect
    })
  ]);

  return {
    items: challenges.map(toChallengeListItemDTO),
    page: query.page,
    limit: query.limit,
    total
  };
}

export async function getPublicChallengeById(
  id: string
): Promise<ChallengeDetailDTO | null> {
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    select: publicChallengeDetailSelect
  });

  if (challenge === null) {
    return null;
  }

  return toChallengeDetailDTO(challenge);
}

export async function createChallengeForAuthor(
  authorId: string,
  input: ChallengeCreateInput
): Promise<CreateChallengeResult> {
  const coherenceError = validateChallengeCoherence(input);

  if (coherenceError !== null) {
    return { status: coherenceError };
  }

  const challenge = await prisma.$transaction(async (tx) => {
    return tx.challenge.create({
      data: {
        authorId,
        title: input.title,
        description: input.description,
        difficulty: input.difficulty,
        secretPattern: input.secretPattern,
        flags: input.flags,
        publicPositiveExample: input.publicPositiveExample,
        publicNegativeExample: input.publicNegativeExample,
        controls: {
          create: input.controls.map((control) => ({
            kind: control.kind,
            value: control.value
          }))
        }
      },
      select: publicChallengeDetailSelect
    });
  });

  return {
    status: "created",
    challenge: toChallengeDetailDTO(challenge)
  };
}
