import type { FastifyInstance } from "fastify";

import {
  API_CHALLENGES_PATH,
  type PublicApiErrorResponse
} from "@regexriddle/shared";

import {
  getPublicChallengeById,
  listPublicChallenges
} from "../services/challenge-service.js";
import {
  parseChallengeId,
  parseChallengeListQuery
} from "../validation/challenge-validation.js";

function errorResponse(
  error: string,
  message: string
): PublicApiErrorResponse {
  return { error, message };
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
}
