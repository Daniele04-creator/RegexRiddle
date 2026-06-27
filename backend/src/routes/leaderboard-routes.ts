import type { FastifyInstance } from "fastify";

import {
  API_LEADERBOARD_PATH,
  type PublicApiErrorResponse
} from "@regexriddle/shared";

import { listPublicLeaderboard } from "../services/leaderboard-service.js";
import { parseLeaderboardQuery } from "../validation/leaderboard-validation.js";

function errorResponse(
  error: string,
  message: string
): PublicApiErrorResponse {
  return { error, message };
}

export function registerLeaderboardRoutes(app: FastifyInstance): void {
  app.get(API_LEADERBOARD_PATH, async (request, reply) => {
    const validation = parseLeaderboardQuery(request.query);

    if (!validation.success) {
      return reply
        .status(400)
        .send(errorResponse("Bad Request", validation.message));
    }

    return listPublicLeaderboard(validation.value);
  });
}
