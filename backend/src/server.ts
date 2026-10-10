import { buildApp } from "./app.js";

const DEFAULT_API_HOST = "0.0.0.0";
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

async function main(): Promise<void> {
  const app = buildApp();
  let isShuttingDown = false;

  async function shutdown(signal: NodeJS.Signals): Promise<void> {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    app.log.info({ signal }, "Shutting down API server");

    try {
      await app.close();
      process.exit(0);
    } catch (error) {
      app.log.error({ err: error }, "Failed to shut down API server");
      process.exit(1);
    }
  }

  process.once("SIGINT", (signal) => {
    void shutdown(signal);
  });
  process.once("SIGTERM", (signal) => {
    void shutdown(signal);
  });

  try {
    const host = process.env.API_HOST ?? DEFAULT_API_HOST;
    const port = readPort(process.env.API_PORT ?? process.env.PORT);

    await app.listen({ host, port });
  } catch (error) {
    app.log.error({ err: error }, "Failed to start API server");

    try {
      await app.close();
    } catch (closeError) {
      app.log.error({ err: closeError }, "Failed to close API server");
    }

    process.exit(1);
  }
}

await main();
