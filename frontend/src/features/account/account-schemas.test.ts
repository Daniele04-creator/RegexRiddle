import { describe, expect, it } from "vitest";

import {
  accountSettingsFormSchema,
  mapAccountSettingsFormToInput
} from "@/features/account/schemas";

describe("account settings schema", () => {
  it("accepts valid displayName, bio, and avatarUrl values", () => {
    const result = accountSettingsFormSchema.safeParse({
      avatarUrl: " https://example.com/avatar.png ",
      bio: " Bio pubblica compatta. ",
      displayName: " Daniele Demo "
    });

    expect(result.success).toBe(true);
    expect(
      mapAccountSettingsFormToInput({
        avatarUrl: " https://example.com/avatar.png ",
        bio: " Bio pubblica compatta. ",
        displayName: " Daniele Demo "
      })
    ).toEqual({
      avatarUrl: "https://example.com/avatar.png",
      bio: "Bio pubblica compatta.",
      displayName: "Daniele Demo"
    });
  });

  it("rejects invalid avatar URLs", () => {
    const result = accountSettingsFormSchema.safeParse({
      avatarUrl: "ftp://example.com/avatar.png",
      bio: "",
      displayName: "Daniele Demo"
    });

    expect(result.success).toBe(false);
  });

  it("maps empty optional account fields to null", () => {
    expect(
      mapAccountSettingsFormToInput({
        avatarUrl: "   ",
        bio: "",
        displayName: " Demo Player "
      })
    ).toEqual({
      avatarUrl: null,
      bio: null,
      displayName: "Demo Player"
    });
  });
});
