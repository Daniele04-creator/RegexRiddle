import type { FastifyInstance } from "fastify";

import {
  API_CHALLENGES_PATH,
  type AttemptSubmissionResponseDTO,
  type PublicApiErrorResponse
} from "@regexriddle/shared";

import { getCurrentUserFromSessionToken } from "../auth/current-user.js";
import { readSessionTokenFromCookieHeader } from "../auth/session.js";
import { validateProtectedJsonMutationHeaders } from "../security/csrf-guard.js";
import { submitChallengeAttempt } from "../services/attempt-service.js";
import { parseAttemptSubmissionBody } from "../validation/attempt-validation.js";
import { parseChallengeId } from "../validation/challenge-validation.js";

function errorResponse(
  error: string,
  message: string
): PublicApiErrorResponse {
  return { error, message };
}

function unauthorizedResponse(): PublicApiErrorResponse {
  return errorResponse("Unauthorized", "Authentication required.");
}

export function registerAttemptRoutes(app: FastifyInstance): void {
  app.post(`${API_CHALLENGES_PATH}/:id/attempts`, async (request, reply) => {
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

    const params = request.params as { id?: unknown };
    const idValidation = parseChallengeId(params.id);

    if (!idValidation.success) {
      return reply
        .status(400)
        .send(errorResponse("Bad Request", idValidation.message));
    }

    const bodyValidation = parseAttemptSubmissionBody(request.body);

    if (!bodyValidation.success) {
      return reply
        .status(400)
        .send(errorResponse("Bad Request", bodyValidation.message));
    }

    const result = await submitChallengeAttempt(
      user.id,
      idValidation.value,
      bodyValidation.value
    );

    if (result.status === "not_found") {
      return reply
        .status(404)
        .send(errorResponse("Not Found", "Challenge was not found."));
    }

    if (result.status === "forbidden_author") {
      return reply
        .status(403)
        .send(errorResponse("Forbidden", "Authors cannot attempt their own challenges."));
    }

    if (result.status === "already_solved") {
      return reply
        .status(409)
        .send(errorResponse("Conflict", "Challenge already solved."));
    }

    if (result.status === "invalid_regex") {
      return reply.status(422).send(
        errorResponse(
          "Unprocessable Entity",
          "Submitted regex is invalid or unsupported."
        )
      );
    }

    const response: AttemptSubmissionResponseDTO = {
      attempt: result.attempt,
      solved: result.solved
    };

    return reply.status(201).send(response);
  });
}
