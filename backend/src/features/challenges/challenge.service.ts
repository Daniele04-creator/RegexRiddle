import type {
  ChallengeCreateRequestDTO,
  ChallengeDetailDTO,
  ChallengeListResponseDTO
} from "@regexriddle/shared";

import {
  toChallengeDetailDTO,
  toChallengeListItemDTO
} from "./challenge.dto.js";
import { prismaChallengeRepository } from "./challenge.repository.js";
import {
  compileSafeRegex,
  isSafeRegexError,
  type CompiledSafeRegex
} from "../../regex/regex-engine.js";
import { matchesAllControls } from "../../regex/attempt-evaluator.js";
import type { ChallengeListQuery } from "./challenge-list.validation.js";

type ChallengeCoherenceError =
  "invalid_regex" | "incoherent_examples" | "incoherent_controls";

type CreateChallengeResult =
  | { status: "created"; challenge: ChallengeDetailDTO }
  | { status: "invalid_regex" }
  | { status: "incoherent_examples" }
  | { status: "incoherent_controls" };

function validateChallengeCoherence(
  input: ChallengeCreateRequestDTO
): ChallengeCoherenceError | null {
  let regex: CompiledSafeRegex;

  try {
    regex = compileSafeRegex(input.secretPattern);
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

  if (!matchesAllControls(regex, input.controls)) {
    return "incoherent_controls";
  }

  return null;
}

export async function listChallenges(
  query: ChallengeListQuery
): Promise<ChallengeListResponseDTO> {
  const challenges = await prismaChallengeRepository.listPublic(query);
  const items = challenges.map(toChallengeListItemDTO);

  return {
    items,
    total: items.length
  };
}

export async function getChallengeById(
  id: string,
  viewerUserId: string
): Promise<ChallengeDetailDTO | null> {
  const challenge = await prismaChallengeRepository.findPublicDetailById(id);

  if (challenge === null) {
    return null;
  }

  const viewer = await prismaChallengeRepository.findViewerState(
    id,
    viewerUserId
  );

  return toChallengeDetailDTO(challenge, viewer);
}

export async function createChallenge(
  authorId: string,
  input: ChallengeCreateRequestDTO
): Promise<CreateChallengeResult> {
  const coherenceError = validateChallengeCoherence(input);

  if (coherenceError !== null) {
    return { status: coherenceError };
  }

  const challenge = await prismaChallengeRepository.createForAuthor(
    authorId,
    input
  );

  return {
    status: "created",
    challenge: toChallengeDetailDTO(challenge)
  };
}
