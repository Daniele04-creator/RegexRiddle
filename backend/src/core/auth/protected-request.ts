import type { FastifyReply, FastifyRequest } from "fastify";

import { sendBadRequest, sendUnauthorized } from "../http/http-responses.js";
import { parseUuidParam } from "../validation/resource-id.js";
import { findUserIdBySessionToken } from "./current-user.js";
import { readSessionTokenFromCookie } from "./session.js";

type CurrentUserIdResult =
  | {
      success: true;
      userId: string;
    }
  | {
      success: false;
      reply: FastifyReply;
    };

type UserResourceResult =
  | {
      success: true;
      userId: string;
      resourceId: string;
    }
  | {
      success: false;
      reply: FastifyReply;
    };

export async function requireCurrentUserId(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<CurrentUserIdResult> {
  const sessionToken = readSessionTokenFromCookie(request.headers.cookie);

  if (sessionToken === null) {
    return {
      success: false,
      reply: sendUnauthorized(reply)
    };
  }

  const userId = await findUserIdBySessionToken(sessionToken);

  if (userId === null) {
    return {
      success: false,
      reply: sendUnauthorized(reply)
    };
  }

  return {
    success: true,
    userId
  };
}

export async function requireUserAndResourceId(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<UserResourceResult> {
  const auth = await requireCurrentUserId(request, reply);

  if (!auth.success) {
    return auth;
  }

  const params = request.params as { id?: unknown };
  const validation = parseUuidParam(params.id);

  if (!validation.success) {
    return {
      success: false,
      reply: sendBadRequest(reply, validation.message, validation.code)
    };
  }

  return {
    success: true,
    userId: auth.userId,
    resourceId: validation.value
  };
}
