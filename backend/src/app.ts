import fastify, { type FastifyInstance, type RawServerDefault } from "fastify";

import {
  API_HEALTH_PATH,
  API_SERVICE_NAME,
  APP_NAME,
  type HealthResponseDTO
} from "@regexriddle/shared";

import { prisma } from "./core/db/prisma.js";
import {
  buildClientErrorResponse,
  sendInternalServerError
} from "./core/http/http-responses.js";
import { applySecurityHeaders } from "./core/http/security-headers.js";
import { registerAccountRoutes } from "./features/account/account.routes.js";
import { registerAttemptRoutes } from "./features/attempts/attempt.routes.js";
import { registerAuthRoutes } from "./features/auth/auth.routes.js";
import { registerChallengeRoutes } from "./features/challenges/challenge.routes.js";
import { registerLeaderboardRoutes } from "./features/leaderboard/leaderboard.routes.js";

const DEFAULT_BODY_LIMIT_BYTES = 512 * 1024;

function readErrorStatusCode(error: unknown): number | null {
  if (error === null || typeof error !== "object" || !("statusCode" in error)) {
    return null;
  }

  const statusCode = error.statusCode;

  return typeof statusCode === "number" ? statusCode : null;
}

function readErrorCode(error: unknown): string | undefined {
  if (error === null || typeof error !== "object" || !("code" in error)) {
    return undefined;
  }

  const code = error.code;

  return typeof code === "string" ? code : undefined;
}

export function buildApp(): FastifyInstance {
  const app = fastify<RawServerDefault>({
    bodyLimit: DEFAULT_BODY_LIMIT_BYTES,
    logger: true
  });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  app.addHook("onRequest", (_request, reply, done) => {
    applySecurityHeaders(reply);
    done();
  });

  app.setErrorHandler((error, request, reply) => {
    const errorStatusCode = readErrorStatusCode(error);
    const statusCode =
      errorStatusCode !== null &&
      errorStatusCode >= 400 &&
      errorStatusCode < 500
        ? errorStatusCode
        : 500;

    if (statusCode === 500) {
      request.log.error({ err: error }, "Unhandled request error");
    } else {
      request.log.warn({ code: readErrorCode(error) }, "Rejected request");
    }

    if (statusCode !== 500) {
      return reply
        .status(statusCode)
        .send(buildClientErrorResponse(statusCode));
    }

    return sendInternalServerError(reply);
  });

  app.get(API_HEALTH_PATH, (): HealthResponseDTO => {
    return {
      status: "ok",
      service: API_SERVICE_NAME,
      appName: APP_NAME
    };
  });

  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send(buildClientErrorResponse(404));
  });

  registerAuthRoutes(app);
  registerAccountRoutes(app);
  registerChallengeRoutes(app);
  registerAttemptRoutes(app);
  registerLeaderboardRoutes(app);

  return app;
}
