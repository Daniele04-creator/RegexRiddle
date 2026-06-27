import { describe, expect, it } from "vitest";

import { API_HEALTH_PATH, API_SERVICE_NAME, APP_NAME } from "@regexriddle/shared";

import { buildApp } from "./app.js";

describe("GET /health", () => {
  it("returns the scaffold health response", async () => {
    const app = buildApp({ logger: false });

    const response = await app.inject({
      method: "GET",
      url: API_HEALTH_PATH
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      service: API_SERVICE_NAME,
      appName: APP_NAME,
      environment: "test"
    });

    await app.close();
  });
});
