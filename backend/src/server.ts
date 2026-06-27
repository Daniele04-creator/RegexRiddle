import { buildApp } from "./app.js";

const DEFAULT_API_PORT = 4000;

function readPort(value: string | undefined): number {
  if (value === undefined || value.trim() === "") {
    return DEFAULT_API_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("API_PORT must be an integer between 1 and 65535.");
  }

  return port;
}

const app = buildApp();
const host = process.env.API_HOST ?? "0.0.0.0";
const port = readPort(process.env.API_PORT ?? process.env.PORT);

try {
  await app.listen({ host, port });
} catch (error) {
  app.log.error({ error }, "Failed to start API server");
  process.exit(1);
}
