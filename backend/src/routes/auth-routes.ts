import type { FastifyInstance } from "fastify";

import {
  API_AUTH_PATH,
  type AccountUpdateResponseDTO,
  type AuthMeResponseDTO,
  type AuthSuccessResponseDTO,
  type AuthUserResponseDTO,
  type PublicApiErrorResponse
} from "@regexriddle/shared";

import { getCurrentUserFromSessionToken } from "../auth/current-user.js";
import {
  buildExpiredSessionCookie,
  buildSessionCookie,
  readSessionTokenFromCookieHeader
} from "../auth/session.js";
import {
  loginUser,
  logoutSession,
  registerUser
} from "../services/auth-service.js";
import { updateCurrentUserAccount } from "../services/account-service.js";
import { validateProtectedJsonMutationHeaders } from "../security/csrf-guard.js";
import { parseAccountUpdateBody } from "../validation/account-validation.js";
import {
  parseLoginBody,
  parseRegisterBody
} from "../validation/auth-validation.js";

function errorResponse(
  error: string,
  message: string
): PublicApiErrorResponse {
  return { error, message };
}

function unauthorizedResponse(): PublicApiErrorResponse {
  return errorResponse("Unauthorized", "Authentication required.");
}

export function registerAuthRoutes(app: FastifyInstance): void {
  app.post(`${API_AUTH_PATH}/register`, async (request, reply) => {
    const validation = parseRegisterBody(request.body);

    if (!validation.success) {
      return reply
        .status(400)
        .send(errorResponse("Bad Request", validation.message));
    }

    const result = await registerUser(validation.value);

    if (result.status === "conflict") {
      return reply
        .status(409)
        .send(errorResponse("Conflict", "Username or email already exists."));
    }

    const response: AuthUserResponseDTO = { user: result.user };

    return reply
      .status(201)
      .header("Set-Cookie", buildSessionCookie(result.sessionToken, result.expiresAt))
      .send(response);
  });

  app.post(`${API_AUTH_PATH}/login`, async (request, reply) => {
    const validation = parseLoginBody(request.body);

    if (!validation.success) {
      return reply
        .status(400)
        .send(errorResponse("Bad Request", validation.message));
    }

    const result = await loginUser(validation.value);

    if (result.status === "invalid_credentials") {
      return reply
        .status(401)
        .send(errorResponse("Unauthorized", "Invalid credentials."));
    }

    const response: AuthUserResponseDTO = { user: result.user };

    return reply
      .header("Set-Cookie", buildSessionCookie(result.sessionToken, result.expiresAt))
      .send(response);
  });

  app.post(`${API_AUTH_PATH}/logout`, async (request, reply) => {
    const sessionToken = readSessionTokenFromCookieHeader(request.headers.cookie);

    await logoutSession(sessionToken);

    const response: AuthSuccessResponseDTO = { success: true };

    return reply
      .header("Set-Cookie", buildExpiredSessionCookie())
      .send(response);
  });

  app.get(`${API_AUTH_PATH}/me`, async (request, reply) => {
    const sessionToken = readSessionTokenFromCookieHeader(request.headers.cookie);

    if (sessionToken === null) {
      return reply.status(401).send(unauthorizedResponse());
    }

    const user = await getCurrentUserFromSessionToken(sessionToken);

    if (user === null) {
      return reply.status(401).send(unauthorizedResponse());
    }

    const response: AuthMeResponseDTO = { user };

    return response;
  });

  app.patch(`${API_AUTH_PATH}/me`, async (request, reply) => {
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

    const validation = parseAccountUpdateBody(request.body);

    if (!validation.success) {
      return reply
        .status(400)
        .send(errorResponse("Bad Request", validation.message));
    }

    const updatedUser = await updateCurrentUserAccount(user.id, validation.value);
    const response: AccountUpdateResponseDTO = { user: updatedUser };

    return response;
  });
}
