import { describe, expect, it } from "vitest";

import { API_CHALLENGES_PATH, API_HEALTH_PATH, APP_NAME } from "./index.js";

describe("shared constants", () => {
  it("exposes minimal scaffold constants", () => {
    expect(APP_NAME).toBe("RegexRiddle");
    expect(API_HEALTH_PATH).toBe("/health");
    expect(API_CHALLENGES_PATH).toBe("/api/challenges");
  });
});
