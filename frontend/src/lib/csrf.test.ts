import { describe, expect, it } from "vitest";

import {
  createCsrfHeaders,
  CSRF_HEADER_NAME,
  CSRF_HEADER_VALUE
} from "@/lib/csrf";

describe("csrf helper", () => {
  it("returns no header for non-mutating or public requests", () => {
    expect(createCsrfHeaders({ protectedMutation: false })).toEqual({});
  });

  it("adds the GOAL 05 CSRF header for future protected mutations", () => {
    expect(createCsrfHeaders({ protectedMutation: true })).toEqual({
      [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
    });
  });
});
