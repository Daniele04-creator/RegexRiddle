import fastify, {
  type FastifyInstance,
  type FastifyServerOptions
} from "fastify";

import {
  API_HEALTH_PATH,
  API_SERVICE_NAME,
  APP_NAME,
  type HealthResponse
} from "@regexriddle/shared";

import { prisma } from "./db/prisma.js";
import { registerAttemptRoutes } from "./routes/attempt-routes.js";
import { registerAuthRoutes } from "./routes/auth-routes.js";
import { registerChallengeRoutes } from "./routes/challenge-routes.js";

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

export function buildApp(options: FastifyServerOptions = {}): FastifyInstance {
  const app = fastify({
    logger: options.logger ?? true
  });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
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
      request.log.error({ error }, "Unhandled request error");
    } else {
      request.log.warn({ code: readErrorCode(error) }, "Rejected request");
    }

    if (statusCode !== 500) {
      return reply.status(statusCode).send({
        error: "Bad Request",
        message: "Invalid request."
      });
    }

    return reply.status(500).send({
      error: "Internal Server Error",
      message: "An unexpected error occurred."
    });
  });

  app.get(API_HEALTH_PATH, async (): Promise<HealthResponse> => {
    return {
      status: "ok",
      service: API_SERVICE_NAME,
      appName: APP_NAME,
      environment: process.env.NODE_ENV ?? "development"
    };
  });

  registerAuthRoutes(app);
  registerChallengeRoutes(app);
  registerAttemptRoutes(app);

  return app;
}
