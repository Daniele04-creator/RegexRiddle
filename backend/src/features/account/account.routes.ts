import type { FastifyInstance } from "fastify";

import {
  API_AUTH_ME_PATH,
  type AccountUpdateResponseDTO
} from "@regexriddle/shared";

import {
  sendBadRequest,
  sendConflict
} from "../../core/http/http-responses.js";
import { requireCurrentUserId } from "../../core/auth/protected-request.js";
import { updateCurrentUserAccount } from "./account.service.js";
import { parseAccountUpdateBody } from "./account.validation.js";

export function registerAccountRoutes(app: FastifyInstance): void {
  app.patch(API_AUTH_ME_PATH, async (request, reply) => {
    const auth = await requireCurrentUserId(request, reply);

    if (!auth.success) {
      return auth.reply;
    }

    const validation = parseAccountUpdateBody(request.body);

    if (!validation.success) {
      return sendBadRequest(reply, validation.message, validation.code);
    }

    const updatedUser = await updateCurrentUserAccount(
      auth.userId,
      validation.value
    );

    if (updatedUser === null) {
      return sendConflict(
        reply,
        "USERNAME_IN_USE",
        "Username is already in use."
      );
    }

    const response: AccountUpdateResponseDTO = { user: updatedUser };

    return response;
  });
}
