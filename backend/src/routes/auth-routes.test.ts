import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  API_AUTH_PATH,
  API_CHALLENGES_PATH,
  API_LEADERBOARD_PATH,
  type AccountUpdateResponseDTO,
  type AuthMeResponseDTO,
  type AuthUserResponseDTO,
  type ChallengeListResponseDTO,
  type LeaderboardResponseDTO
} from "@regexriddle/shared";

import { hashSessionToken, SESSION_COOKIE_NAME } from "../auth/session.js";
import { buildApp } from "../app.js";
import { prisma } from "../db/prisma.js";
import {
  CSRF_HEADER_NAME,
  CSRF_HEADER_VALUE
} from "../security/csrf-guard.js";

import type { FastifyInstance } from "fastify";
import type { OutgoingHttpHeaders } from "node:http";

const DEMO_USERNAME = "demo_player";
const DEMO_EMAIL = "demo_player@example.test";
const DEMO_PASSWORD = "Password123!";
const DEMO_DISPLAY_NAME = "Demo Player";
const DEMO_BIO = "Demo solver account with solved and unsolved attempts.";
const FORBIDDEN_RESPONSE_KEYS = [
  "passwordHash",
  "sessionTokenHash",
  "token",
  "sessionToken",
  "secretPattern",
  "controls",
  "proposedPattern"
];

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

function collectKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectKeys(item, keys);
    }

    return keys;
  }

  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      keys.add(key);
      collectKeys(child, keys);
    }
  }

  return keys;
}

function expectNoSensitiveKeys(
  value: unknown,
  forbiddenValue?: string
): void {
  const keys = collectKeys(value);

  for (const forbiddenKey of FORBIDDEN_RESPONSE_KEYS) {
    expect(keys.has(forbiddenKey)).toBe(false);
  }

  if (forbiddenValue !== undefined) {
    expect(JSON.stringify(value)).not.toContain(forbiddenValue);
  }
}

function readSetCookieHeader(response: {
  headers: OutgoingHttpHeaders;
}): string {
  const header = response.headers["set-cookie"];

  if (Array.isArray(header)) {
    expect(header.length).toBeGreaterThan(0);
    return header[0];
  }

  expect(header).toBeTypeOf("string");
  return typeof header === "string" ? header : "";
}

function readCookiePair(setCookie: string): string {
  return setCookie.split(";")[0] ?? "";
}

function readCookieValue(setCookie: string): string {
  const pair = readCookiePair(setCookie);
  const [, value] = pair.split("=");

  return value ?? "";
}

function expectSessionCookie(setCookie: string): void {
  expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=`);
  expect(setCookie).toContain("HttpOnly");
  expect(setCookie).toContain("SameSite=Lax");
  expect(setCookie).toContain("Path=/");
  expect(setCookie).toContain("Max-Age=");
}

function makeRegisterPayload(suffix: string): RegisterPayload {
  return {
    username: `auth_test_${suffix}`,
    email: `auth_test_${suffix}@example.test`,
    password: "AuthTest123!",
    displayName: `Auth Test ${suffix}`
  };
}

async function cleanupAuthTestData(): Promise<void> {
  const testUsers = await prisma.user.findMany({
    where: { username: { startsWith: "auth_test_" } },
    select: { id: true }
  });
  const testUserIds = testUsers.map((user) => user.id);

  await prisma.session.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  await prisma.user.deleteMany({
    where: { id: { in: testUserIds } }
  });
}

async function resetDemoUserProfile(): Promise<void> {
  await prisma.user.update({
    where: { username: DEMO_USERNAME },
    data: {
      displayName: DEMO_DISPLAY_NAME,
      bio: DEMO_BIO,
      avatarUrl: null
    }
  });
}

describe("auth routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    await cleanupAuthTestData();
    await resetDemoUserProfile();
    app = buildApp({ logger: false });
  });

  beforeEach(async () => {
    await resetDemoUserProfile();
  });

  afterAll(async () => {
    await cleanupAuthTestData();
    await resetDemoUserProfile();
    await app.close();
  });

  async function loginDemoUser(): Promise<{ cookie: string; sessionToken: string }> {
    const loginResponse = await app.inject({
      method: "POST",
      url: `${API_AUTH_PATH}/login`,
      payload: {
        usernameOrEmail: DEMO_USERNAME,
        password: DEMO_PASSWORD
      }
    });
    const setCookie = readSetCookieHeader(loginResponse);

    expect(loginResponse.statusCode).toBe(200);

    return {
      cookie: readCookiePair(setCookie),
      sessionToken: readCookieValue(setCookie)
    };
  }

  it("register creates a user and does not expose sensitive fields", async () => {
    const payload = makeRegisterPayload("create");
    const response = await app.inject({
      method: "POST",
      url: `${API_AUTH_PATH}/register`,
      payload
    });
    const body = response.json<AuthUserResponseDTO>();
    const setCookie = readSetCookieHeader(response);
    const sessionToken = readCookieValue(setCookie);
    const storedUser = await prisma.user.findUnique({
      where: { username: payload.username },
      select: { passwordHash: true }
    });

    expect(response.statusCode).toBe(201);
    expect(body.user).toMatchObject({
      username: payload.username,
      email: payload.email,
      displayName: payload.displayName
    });
    expect(storedUser?.passwordHash).toBeTypeOf("string");
    expect(storedUser?.passwordHash).not.toBe(payload.password);
    expectNoSensitiveKeys(body, sessionToken);
  });

  it("register sets an HttpOnly SameSite session cookie", async () => {
    const response = await app.inject({
      method: "POST",
      url: `${API_AUTH_PATH}/register`,
      payload: makeRegisterPayload("cookie")
    });
    const setCookie = readSetCookieHeader(response);

    expect(response.statusCode).toBe(201);
    expectSessionCookie(setCookie);
  });

  it("register duplicate returns 409", async () => {
    const payload = makeRegisterPayload("duplicate");

    await app.inject({
      method: "POST",
      url: `${API_AUTH_PATH}/register`,
      payload
    });

    const response = await app.inject({
      method: "POST",
      url: `${API_AUTH_PATH}/register`,
      payload
    });

    expect(response.statusCode).toBe(409);
    expectNoSensitiveKeys(response.json());
  });

  it("login with a demo user works, stores only a token hash, and sets a cookie", async () => {
    const response = await app.inject({
      method: "POST",
      url: `${API_AUTH_PATH}/login`,
      payload: {
        usernameOrEmail: DEMO_USERNAME,
        password: DEMO_PASSWORD
      }
    });
    const body = response.json<AuthUserResponseDTO>();
    const setCookie = readSetCookieHeader(response);
    const sessionToken = readCookieValue(setCookie);
    const sessionTokenHash = hashSessionToken(sessionToken);
    const storedSession = await prisma.session.findUnique({
      where: { sessionTokenHash },
      select: { sessionTokenHash: true }
    });

    expect(response.statusCode).toBe(200);
    expect(body.user.username).toBe(DEMO_USERNAME);
    expectSessionCookie(setCookie);
    expect(storedSession?.sessionTokenHash).toBe(sessionTokenHash);
    expect(storedSession?.sessionTokenHash).not.toBe(sessionToken);
    expectNoSensitiveKeys(body, sessionToken);
  });

  it("login with invalid credentials returns a generic 401", async () => {
    const response = await app.inject({
      method: "POST",
      url: `${API_AUTH_PATH}/login`,
      payload: {
        usernameOrEmail: DEMO_EMAIL,
        password: "WrongPassword123!"
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: "Unauthorized",
      message: "Invalid credentials."
    });
    expectNoSensitiveKeys(response.json());
  });

  it("me without a cookie returns 401", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_AUTH_PATH}/me`
    });

    expect(response.statusCode).toBe(401);
    expectNoSensitiveKeys(response.json());
  });

  it("me with a valid cookie returns the public user", async () => {
    const loginResponse = await app.inject({
      method: "POST",
      url: `${API_AUTH_PATH}/login`,
      payload: {
        usernameOrEmail: DEMO_EMAIL,
        password: DEMO_PASSWORD
      }
    });
    const setCookie = readSetCookieHeader(loginResponse);
    const sessionToken = readCookieValue(setCookie);
    const response = await app.inject({
      method: "GET",
      url: `${API_AUTH_PATH}/me`,
      headers: {
        cookie: readCookiePair(setCookie)
      }
    });
    const body = response.json<AuthMeResponseDTO>();

    expect(response.statusCode).toBe(200);
    expect(body.user.username).toBe(DEMO_USERNAME);
    expect(body.user.bio).toBe(DEMO_BIO);
    expect(body.user.avatarUrl).toBeNull();
    expectNoSensitiveKeys(body, sessionToken);
  });

  it("account update rejects requests without authentication", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: `${API_AUTH_PATH}/me`,
      headers: {
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        displayName: "Rejected Demo"
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: "Unauthorized",
      message: "Authentication required."
    });
    expectNoSensitiveKeys(response.json());
  });

  it("account update rejects missing and wrong CSRF headers", async () => {
    const { cookie, sessionToken } = await loginDemoUser();
    const missingResponse = await app.inject({
      method: "PATCH",
      url: `${API_AUTH_PATH}/me`,
      headers: {
        cookie
      },
      payload: {
        displayName: "Missing CSRF"
      }
    });
    const wrongResponse = await app.inject({
      method: "PATCH",
      url: `${API_AUTH_PATH}/me`,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: "0"
      },
      payload: {
        displayName: "Wrong CSRF"
      }
    });

    expect(missingResponse.statusCode).toBe(403);
    expect(wrongResponse.statusCode).toBe(403);
    expect(missingResponse.json()).toEqual({
      error: "Forbidden",
      message: "CSRF header is required."
    });
    expect(wrongResponse.json()).toEqual({
      error: "Forbidden",
      message: "CSRF header is required."
    });
    expectNoSensitiveKeys(missingResponse.json(), sessionToken);
    expectNoSensitiveKeys(wrongResponse.json(), sessionToken);
  });

  it("account update requires JSON content", async () => {
    const { cookie } = await loginDemoUser();
    const response = await app.inject({
      method: "PATCH",
      url: `${API_AUTH_PATH}/me`,
      headers: {
        cookie,
        "content-type": "text/plain",
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: JSON.stringify({
        displayName: "Plain Text"
      })
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: "Bad Request",
      message: "Content-Type must be application/json."
    });
    expectNoSensitiveKeys(response.json());
  });

  it("account update changes allowed fields only and returns current-user DTO", async () => {
    const { cookie, sessionToken } = await loginDemoUser();
    const response = await app.inject({
      method: "PATCH",
      url: `${API_AUTH_PATH}/me`,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        displayName: "  Account Demo  ",
        bio: "  Mi sto preparando all'orale di Tecnologie Web.  ",
        avatarUrl: " https://example.com/avatar.png "
      }
    });
    const body = response.json<AccountUpdateResponseDTO>();
    const storedUser = await prisma.user.findUnique({
      where: { username: DEMO_USERNAME },
      select: {
        displayName: true,
        bio: true,
        avatarUrl: true,
        email: true,
        username: true
      }
    });

    expect(response.statusCode).toBe(200);
    expect(body.user).toMatchObject({
      username: DEMO_USERNAME,
      email: DEMO_EMAIL,
      displayName: "Account Demo",
      bio: "Mi sto preparando all'orale di Tecnologie Web.",
      avatarUrl: "https://example.com/avatar.png"
    });
    expect(storedUser).toEqual({
      username: DEMO_USERNAME,
      email: DEMO_EMAIL,
      displayName: "Account Demo",
      bio: "Mi sto preparando all'orale di Tecnologie Web.",
      avatarUrl: "https://example.com/avatar.png"
    });
    expectNoSensitiveKeys(body, sessionToken);
  });

  it("account update maps empty optional fields to null", async () => {
    const { cookie } = await loginDemoUser();
    const response = await app.inject({
      method: "PATCH",
      url: `${API_AUTH_PATH}/me`,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        bio: "   ",
        avatarUrl: ""
      }
    });
    const body = response.json<AccountUpdateResponseDTO>();

    expect(response.statusCode).toBe(200);
    expect(body.user.bio).toBeNull();
    expect(body.user.avatarUrl).toBeNull();
  });

  it("account update rejects invalid avatar URLs", async () => {
    const { cookie } = await loginDemoUser();
    const response = await app.inject({
      method: "PATCH",
      url: `${API_AUTH_PATH}/me`,
      headers: {
        cookie,
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
      },
      payload: {
        avatarUrl: "ftp://example.com/avatar.png"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: "Bad Request",
      message: "avatarUrl must be an http or https URL."
    });
    expectNoSensitiveKeys(response.json());
  });

  it("account update rejects unknown and mass-assignment fields", async () => {
    const { cookie } = await loginDemoUser();
    const rejectedKeys = [
      "id",
      "username",
      "email",
      "password",
      "passwordHash",
      "sessionTokenHash",
      "createdAt",
      "updatedAt",
      "sessions",
      "attempts",
      "solutions",
      "challenges",
      "_count"
    ];

    for (const rejectedKey of rejectedKeys) {
      const response = await app.inject({
        method: "PATCH",
        url: `${API_AUTH_PATH}/me`,
        headers: {
          cookie,
          [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
        },
        payload: {
          displayName: "Still Valid",
          [rejectedKey]: "MUST_NOT_ASSIGN"
        }
      });

      expect(response.statusCode, rejectedKey).toBe(400);
      expectNoSensitiveKeys(response.json(), "MUST_NOT_ASSIGN");
    }
  });

  it("logout invalidates the session and clears the cookie", async () => {
    const loginResponse = await app.inject({
      method: "POST",
      url: `${API_AUTH_PATH}/login`,
      payload: {
        usernameOrEmail: DEMO_USERNAME,
        password: DEMO_PASSWORD
      }
    });
    const loginCookie = readSetCookieHeader(loginResponse);
    const sessionTokenHash = hashSessionToken(readCookieValue(loginCookie));
    const response = await app.inject({
      method: "POST",
      url: `${API_AUTH_PATH}/logout`,
      headers: {
        cookie: readCookiePair(loginCookie)
      }
    });
    const setCookie = readSetCookieHeader(response);
    const storedSession = await prisma.session.findUnique({
      where: { sessionTokenHash },
      select: { id: true }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ success: true });
    expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(setCookie).toContain("Max-Age=0");
    expect(storedSession).toBeNull();
    expectNoSensitiveKeys(response.json());
  });

  it("after logout, me returns 401", async () => {
    const loginResponse = await app.inject({
      method: "POST",
      url: `${API_AUTH_PATH}/login`,
      payload: {
        usernameOrEmail: DEMO_USERNAME,
        password: DEMO_PASSWORD
      }
    });
    const loginCookie = readSetCookieHeader(loginResponse);

    await app.inject({
      method: "POST",
      url: `${API_AUTH_PATH}/logout`,
      headers: {
        cookie: readCookiePair(loginCookie)
      }
    });

    const response = await app.inject({
      method: "GET",
      url: `${API_AUTH_PATH}/me`,
      headers: {
        cookie: readCookiePair(loginCookie)
      }
    });

    expect(response.statusCode).toBe(401);
    expectNoSensitiveKeys(response.json());
  });

  it("keeps public challenge APIs accessible without auth", async () => {
    const response = await app.inject({
      method: "GET",
      url: API_CHALLENGES_PATH
    });

    expect(response.statusCode).toBe(200);
    expectNoSensitiveKeys(response.json());
  });

  it("keeps public challenge author DTOs limited to public identity", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_CHALLENGES_PATH}?limit=1&page=1`
    });
    const body = response.json<ChallengeListResponseDTO>();
    const author = body.items[0]?.author;

    expect(response.statusCode).toBe(200);
    expect(author).toBeDefined();
    expect(Object.keys(author ?? {}).sort()).toEqual(["displayName", "username"]);
  });

  it("keeps public leaderboard DTOs free of account private fields", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${API_LEADERBOARD_PATH}?limit=10&page=1`
    });
    const body = response.json<LeaderboardResponseDTO>();
    const user = body.items[0]?.user;

    expect(response.statusCode).toBe(200);
    expect(user).toBeDefined();
    expect(Object.keys(user ?? {}).sort()).toEqual(["displayName", "username"]);
  });
});
