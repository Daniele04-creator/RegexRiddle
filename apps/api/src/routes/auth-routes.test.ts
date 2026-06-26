import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  API_AUTH_PATH,
  API_CHALLENGES_PATH,
  type AuthMeResponseDTO,
  type AuthUserResponseDTO
} from "@regexriddle/shared";

import { hashSessionToken, SESSION_COOKIE_NAME } from "../auth/session.js";
import { buildApp } from "../app.js";
import { prisma } from "../db/prisma.js";

import type { FastifyInstance } from "fastify";
import type { OutgoingHttpHeaders } from "node:http";

const DEMO_PLAYER_ID = "22222222-2222-4222-8222-222222222222";
const DEMO_USERNAME = "demo_player";
const DEMO_EMAIL = "demo_player@example.test";
const DEMO_PASSWORD = "Password123!";
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
    where: {
      OR: [{ userId: { in: testUserIds } }, { userId: DEMO_PLAYER_ID }]
    }
  });
  await prisma.user.deleteMany({
    where: { id: { in: testUserIds } }
  });
}

describe("auth routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    await cleanupAuthTestData();
    app = buildApp({ logger: false });
  });

  afterAll(async () => {
    await cleanupAuthTestData();
    await app.close();
  });

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
    expectNoSensitiveKeys(body, sessionToken);
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
});
