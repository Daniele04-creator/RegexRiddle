import type {
  AccountUpdateRequestDTO,
  PublicUserDTO
} from "@regexriddle/shared";
import { vi } from "vitest";

export const demoUser: PublicUserDTO = {
  id: "22222222-2222-4222-8222-222222222222",
  username: "demo_player",
  email: "demo_player@example.test",
  displayName: "Demo Player",
  bio: "Demo solver account with solved and unsolved attempts.",
  avatarUrl: null,
  createdAt: "2026-06-27T08:00:00.000Z"
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status
  });
}

interface MockAppFetchOptions {
  duplicateRegister?: boolean;
  initialUser?: PublicUserDTO | null;
}

export function mockAppFetch({
  duplicateRegister = false,
  initialUser = null
}: MockAppFetchOptions = {}) {
  let currentUser = initialUser;
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = String(input);

      if (path === "/health") {
        return jsonResponse({
          status: "ok",
          service: "regexriddle-api",
          appName: "RegexRiddle",
          environment: "test"
        });
      }

      if (path === "/api/auth/me" && init?.method === "PATCH") {
        if (currentUser === null) {
          return jsonResponse(
            { error: "Unauthorized", message: "Authentication required." },
            401
          );
        }

        if (new Headers(init.headers).get("X-RegexRiddle-CSRF") !== "1") {
          return jsonResponse(
            { error: "Forbidden", message: "CSRF header is required." },
            403
          );
        }

        const body = JSON.parse(String(init.body)) as AccountUpdateRequestDTO;

        currentUser = {
          ...currentUser,
          avatarUrl: body.avatarUrl ?? null,
          bio: body.bio ?? null,
          displayName: body.displayName ?? currentUser.displayName
        };

        return jsonResponse({
          user: {
            ...currentUser,
            passwordHash: "MALICIOUS_PASSWORD_HASH",
            sessionTokenHash: "MALICIOUS_SESSION_HASH"
          }
        });
      }

      if (path === "/api/auth/me") {
        if (currentUser === null) {
          return jsonResponse(
            { error: "Unauthorized", message: "Authentication required." },
            401
          );
        }

        return jsonResponse({ user: currentUser });
      }

      if (path === "/api/auth/login" && init?.method === "POST") {
        const body = JSON.parse(String(init.body)) as {
          password?: string;
          usernameOrEmail?: string;
        };

        if (
          body.usernameOrEmail === "demo_player" &&
          body.password === "Password123!"
        ) {
          currentUser = demoUser;

          return jsonResponse({ user: currentUser });
        }

        return jsonResponse(
          { error: "Unauthorized", message: "Invalid credentials." },
          401
        );
      }

      if (path === "/api/auth/register" && init?.method === "POST") {
        if (duplicateRegister) {
          return jsonResponse(
            { error: "Conflict", message: "Username or email already exists." },
            409
          );
        }

        const body = JSON.parse(String(init.body)) as {
          displayName: string;
          email: string;
          username: string;
        };

        currentUser = {
          id: "33333333-3333-4333-8333-333333333333",
          username: body.username,
          email: body.email,
          displayName: body.displayName,
          bio: null,
          avatarUrl: null,
          createdAt: "2026-06-27T09:00:00.000Z"
        };

        return jsonResponse({ user: currentUser }, 201);
      }

      if (path === "/api/auth/logout" && init?.method === "POST") {
        currentUser = null;

        return jsonResponse({ success: true });
      }

      return jsonResponse({ error: "Not Found", message: "Unhandled test path." }, 404);
    }
  );

  vi.stubGlobal("fetch", fetchMock);

  return {
    fetchMock,
    getCurrentUser: () => currentUser
  };
}
