import { describe, expect, it } from "vitest";

import { webSmokeCopy } from "./content.js";

describe("web smoke copy", () => {
  it("keeps the scaffold smoke text available to the app", () => {
    expect(webSmokeCopy.title).toBe("RegexRiddle");
    expect(webSmokeCopy.summary).toContain("scaffold");
  });
});
