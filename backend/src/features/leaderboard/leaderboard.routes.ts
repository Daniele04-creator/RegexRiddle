import type { FastifyInstance } from "fastify";

import { API_LEADERBOARD_PATH } from "@regexriddle/shared";

import { requireCurrentUserId } from "../../core/auth/protected-request.js";
import { getLeaderboard } from "./leaderboard.service.js";
import { sendBadRequest } from "../../core/http/http-responses.js";

export function registerLeaderboardRoutes(app: FastifyInstance): void {
  app.get(API_LEADERBOARD_PATH, async (request, reply) => {
    const auth = await requireCurrentUserId(request, reply);

    if (!auth.success) {
      return auth.reply;
    }

    if (Object.keys(request.query as Record<string, unknown>).length > 0) {
      return sendBadRequest(reply, "Unsupported query parameter.");
    }

    return getLeaderboard();
  });
}
