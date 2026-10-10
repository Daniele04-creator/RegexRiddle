import type { FastifyInstance } from "fastify";

import {
  API_CHALLENGES_PATH,
  type ChallengeDetailDTO
} from "@regexriddle/shared";

import {
  requireCurrentUserId,
  requireUserAndResourceId
} from "../../core/auth/protected-request.js";
import {
  createChallenge,
  getChallengeById,
  listChallenges
} from "./challenge.service.js";
import { parseCreateChallengeBody } from "./challenge-create.validation.js";
import { parseChallengeListQuery } from "./challenge-list.validation.js";
import {
  sendBadRequest,
  sendNotFound,
  sendUnprocessableEntity
} from "../../core/http/http-responses.js";

export function registerChallengeRoutes(app: FastifyInstance): void {
  app.get(API_CHALLENGES_PATH, async (request, reply) => {
    const auth = await requireCurrentUserId(request, reply);

    if (!auth.success) {
      return auth.reply;
    }

    const validation = parseChallengeListQuery(request.query);

    if (!validation.success) {
      return sendBadRequest(reply, validation.message, validation.code);
    }

    return listChallenges(validation.value);
  });

  app.get(`${API_CHALLENGES_PATH}/:id`, async (request, reply) => {
    const access = await requireUserAndResourceId(request, reply);

    if (!access.success) {
      return access.reply;
    }

    const challenge = await getChallengeById(access.resourceId, access.userId);

    if (challenge === null) {
      return sendNotFound(reply, "Challenge was not found.");
    }

    return challenge;
  });

  app.post(API_CHALLENGES_PATH, async (request, reply) => {
    const auth = await requireCurrentUserId(request, reply);

    if (!auth.success) {
      return auth.reply;
    }

    const bodyValidation = parseCreateChallengeBody(request.body);

    if (!bodyValidation.success) {
      return sendBadRequest(reply, bodyValidation.message, bodyValidation.code);
    }

    const result = await createChallenge(auth.userId, bodyValidation.value);

    if (result.status === "invalid_regex") {
      return sendUnprocessableEntity(
        reply,
        "INVALID_REGEX",
        "Secret regex is invalid or unsupported."
      );
    }

    if (
      result.status === "incoherent_examples" ||
      result.status === "incoherent_controls"
    ) {
      return sendUnprocessableEntity(
        reply,
        "INCOHERENT_CHALLENGE",
        "Challenge examples or controls do not match the secret regex."
      );
    }

    const response: ChallengeDetailDTO = result.challenge;

    return reply
      .status(201)
      .header("Location", `${API_CHALLENGES_PATH}/${response.id}`)
      .send(response);
  });
}
