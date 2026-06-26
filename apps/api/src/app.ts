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
import { registerChallengeRoutes } from "./routes/challenge-routes.js";

export function buildApp(options: FastifyServerOptions = {}): FastifyInstance {
  const app = fastify({
    logger: options.logger ?? true
  });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ error }, "Unhandled request error");
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

  registerChallengeRoutes(app);

  return app;
}
