import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser
} from "@/features/auth/api";

function mockJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status
  });
}

const userResponse = {
  user: {
    id: "22222222-2222-4222-8222-222222222222",
    username: "demo_player",
    email: "demo_player@example.test",
    displayName: "Demo Player",
    createdAt: "2026-06-27T08:00:00.000Z"
  }
};

describe("auth API functions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("treats 401 from current user as a guest session", async () => {
    const fetchMock = vi.fn(async (...args: Parameters<typeof fetch>) => {
      void args;

      return mockJsonResponse(
        { error: "Unauthorized", message: "Authentication required." },
        401
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/me",
      expect.objectContaining({
        credentials: "include",
        method: "GET"
      })
    );
  });

  it("logs in through the same-origin client with credentials", async () => {
    const fetchMock = vi.fn(async (...args: Parameters<typeof fetch>) => {
      void args;

      return mockJsonResponse(userResponse);
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      loginUser({ usernameOrEmail: "demo_player", password: "Password123!" })
    ).resolves.toEqual(userResponse.user);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        body: JSON.stringify({
          usernameOrEmail: "demo_player",
          password: "Password123!"
        }),
        credentials: "include",
        method: "POST"
      })
    );
  });

  it("registers without sending confirmPassword", async () => {
    const fetchMock = vi.fn(async (...args: Parameters<typeof fetch>) => {
      void args;

      return mockJsonResponse(userResponse, 201);
    });
    vi.stubGlobal("fetch", fetchMock);

    await registerUser({
      username: "student_demo",
      email: "student_demo@example.test",
      displayName: "Student Demo",
      password: "Password123!"
    });

    const init = fetchMock.mock.calls[0]?.[1];

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        credentials: "include",
        method: "POST"
      })
    );
    expect(init?.body).toBe(
      JSON.stringify({
        username: "student_demo",
        email: "student_demo@example.test",
        displayName: "Student Demo",
        password: "Password123!"
      })
    );
    expect(String(init?.body)).not.toContain("confirmPassword");
  });

  it("logs out with credentials and without reading cookies", async () => {
    const fetchMock = vi.fn(async (...args: Parameters<typeof fetch>) => {
      void args;

      return mockJsonResponse({ success: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(logoutUser()).resolves.toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({
        credentials: "include",
        method: "POST"
      })
    );
  });
});
