import type { FastifyInstance } from "fastify";

import {
  API_AUTH_LOGIN_PATH,
  API_AUTH_LOGOUT_PATH,
  API_AUTH_ME_PATH,
  API_AUTH_REGISTER_PATH,
  type AuthSuccessResponseDTO,
  type AuthUserResponseDTO
} from "@regexriddle/shared";

import { findUserBySessionToken } from "../../core/auth/current-user.js";
import {
  buildExpiredSessionCookie,
  buildSessionCookie,
  readSessionTokenFromCookie
} from "../../core/auth/session.js";
import { loginUser, logoutSession, registerUser } from "./auth.service.js";
import { parseLoginBody, parseRegisterBody } from "./auth.validation.js";
import {
  errorResponse,
  sendBadRequest,
  sendConflict,
  sendUnauthorized
} from "../../core/http/http-responses.js";

export function registerAuthRoutes(app: FastifyInstance): void {
  app.post(API_AUTH_REGISTER_PATH, async (request, reply) => {
    const validation = parseRegisterBody(request.body);

    if (!validation.success) {
      return sendBadRequest(reply, validation.message, validation.code);
    }

    const result = await registerUser(validation.value);

    if (result === "username_in_use") {
      return sendConflict(
        reply,
        "USERNAME_IN_USE",
        "Username is already in use."
      );
    }

    const response: AuthSuccessResponseDTO = { success: true };

    return reply.send(response);
  });

  app.post(API_AUTH_LOGIN_PATH, async (request, reply) => {
    const validation = parseLoginBody(request.body);

    if (!validation.success) {
      return sendBadRequest(reply, validation.message, validation.code);
    }

    const result = await loginUser(validation.value);

    if (result.status === "invalid_credentials") {
      return reply
        .status(401)
        .send(
          errorResponse(
            "INVALID_CREDENTIALS",
            "Unauthorized",
            "Invalid credentials."
          )
        );
    }

    const response: AuthUserResponseDTO = { user: result.user };

    return reply
      .header(
        "Set-Cookie",
        buildSessionCookie(result.sessionToken, result.expiresAt)
      )
      .send(response);
  });

  app.post(API_AUTH_LOGOUT_PATH, async (request, reply) => {
    const sessionToken = readSessionTokenFromCookie(request.headers.cookie);

    await logoutSession(sessionToken);

    const response: AuthSuccessResponseDTO = { success: true };

    return reply
      .header("Set-Cookie", buildExpiredSessionCookie())
      .send(response);
  });

  app.get(API_AUTH_ME_PATH, async (request, reply) => {
    const sessionToken = readSessionTokenFromCookie(request.headers.cookie);

    if (sessionToken === null) {
      return sendUnauthorized(reply);
    }

    const user = await findUserBySessionToken(sessionToken);

    if (user === null) {
      return sendUnauthorized(reply);
    }

    const response: AuthUserResponseDTO = { user };

    return response;
  });
}
