import type { FastifyInstance } from "fastify";

import {
  API_CHALLENGES_PATH,
  type ChallengeDetailDTO,
  type PublicApiErrorResponse
} from "@regexriddle/shared";

import { getCurrentUserFromSessionToken } from "../auth/current-user.js";
import { readSessionTokenFromCookieHeader } from "../auth/session.js";
import { validateProtectedJsonMutationHeaders } from "../security/csrf-guard.js";
import {
  createChallengeForAuthor,
  getPublicChallengeById,
  listPublicChallenges
} from "../services/challenge-service.js";
import {
  parseCreateChallengeBody,
  parseChallengeId,
  parseChallengeListQuery
} from "../validation/challenge-validation.js";

function errorResponse(
  error: string,
  message: string
): PublicApiErrorResponse {
  return { error, message };
}

function unauthorizedResponse(): PublicApiErrorResponse {
  return errorResponse("Unauthorized", "Authentication required.");
}

export function registerChallengeRoutes(app: FastifyInstance): void {
  app.get(API_CHALLENGES_PATH, async (request, reply) => {
    const validation = parseChallengeListQuery(request.query);

    if (!validation.success) {
      return reply
        .status(400)
        .send(errorResponse("Bad Request", validation.message));
    }

    return listPublicChallenges(validation.value);
  });

  app.get(`${API_CHALLENGES_PATH}/:id`, async (request, reply) => {
    const params = request.params as { id?: unknown };
    const validation = parseChallengeId(params.id);

    if (!validation.success) {
      return reply
        .status(400)
        .send(errorResponse("Bad Request", validation.message));
    }

    const challenge = await getPublicChallengeById(validation.value);

    if (challenge === null) {
      return reply
        .status(404)
        .send(errorResponse("Not Found", "Challenge was not found."));
    }

    return challenge;
  });

  app.post(API_CHALLENGES_PATH, async (request, reply) => {
    const sessionToken = readSessionTokenFromCookieHeader(request.headers.cookie);

    if (sessionToken === null) {
      return reply.status(401).send(unauthorizedResponse());
    }

    const user = await getCurrentUserFromSessionToken(sessionToken);

    if (user === null) {
      return reply.status(401).send(unauthorizedResponse());
    }

    const mutationGuard = validateProtectedJsonMutationHeaders(request.headers);

    if (!mutationGuard.success) {
      return reply
        .status(mutationGuard.statusCode)
        .send(errorResponse(mutationGuard.error, mutationGuard.message));
    }

    const bodyValidation = parseCreateChallengeBody(request.body);

    if (!bodyValidation.success) {
      return reply
        .status(400)
        .send(errorResponse("Bad Request", bodyValidation.message));
    }

    const result = await createChallengeForAuthor(user.id, bodyValidation.value);

    if (result.status === "invalid_regex") {
      return reply.status(422).send(
        errorResponse(
          "Unprocessable Entity",
          "Secret regex is invalid or unsupported."
        )
      );
    }

    if (
      result.status === "incoherent_examples" ||
      result.status === "incoherent_controls"
    ) {
      return reply.status(422).send(
        errorResponse(
          "Unprocessable Entity",
          "Challenge examples or controls do not match the secret regex."
        )
      );
    }

    const response: ChallengeDetailDTO = result.challenge;

    return reply
      .status(201)
      .header("Location", `${API_CHALLENGES_PATH}/${response.id}`)
      .send(response);
  });
}
