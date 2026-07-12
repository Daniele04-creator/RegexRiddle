import type { FastifyInstance } from "fastify";

import {
  API_CHALLENGES_PATH,
  type AttemptSubmissionResponseDTO
} from "@regexriddle/shared";

import { requireUserAndResourceId } from "../../core/auth/protected-request.js";
import { submitAttempt } from "./attempt.service.js";
import { parseAttemptSubmissionBody } from "./attempt.validation.js";
import {
  sendBadRequest,
  sendConflict,
  sendForbidden,
  sendNotFound,
  sendUnprocessableEntity
} from "../../core/http/http-responses.js";

export function registerAttemptRoutes(app: FastifyInstance): void {
  app.post(`${API_CHALLENGES_PATH}/:id/attempts`, async (request, reply) => {
    const access = await requireUserAndResourceId(request, reply);

    if (!access.success) {
      return access.reply;
    }

    const bodyValidation = parseAttemptSubmissionBody(request.body);

    if (!bodyValidation.success) {
      return sendBadRequest(reply, bodyValidation.message, bodyValidation.code);
    }

    const result = await submitAttempt(
      access.userId,
      access.resourceId,
      bodyValidation.value
    );

    if (result.status === "not_found") {
      return sendNotFound(reply, "Challenge was not found.");
    }

    if (result.status === "forbidden_author") {
      return sendForbidden(
        reply,
        "AUTHOR_CANNOT_ATTEMPT",
        "Authors cannot attempt their own challenges."
      );
    }

    if (result.status === "already_solved") {
      return sendConflict(
        reply,
        "CHALLENGE_ALREADY_SOLVED",
        "Challenge already solved."
      );
    }

    if (result.status === "invalid_regex") {
      return sendUnprocessableEntity(
        reply,
        "INVALID_REGEX",
        "Submitted regex is invalid or unsupported."
      );
    }

    const response: AttemptSubmissionResponseDTO = {
      attempt: result.attempt
    };

    return reply.status(201).send(response);
  });
}
