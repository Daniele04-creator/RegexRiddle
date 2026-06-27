import { expect, test, type APIRequestContext } from "@playwright/test";

import { prisma } from "../../api/src/db/prisma.js";

const forbiddenResponseKeys = [
  "secretPattern",
  "controls",
  "value",
  "proposedPattern",
  "passwordHash",
  "sessionTokenHash",
  "token",
  "sessionToken"
];

interface AuthUserResponseBody {
  user: {
    username: string;
    email: string;
    displayName: string;
  };
}

interface AttemptSubmissionResponseBody {
  attempt: {
    challengeId: string;
    attemptNumber: number;
    positiveMatched: number;
    positiveTotal: number;
    negativeMatched: number;
    negativeTotal: number;
    isCorrect: boolean;
  };
  solved: boolean;
}

const demoPlayerId = "22222222-2222-4222-8222-222222222222";
const attemptChallengeId = "aaaaaaaa-0006-4000-8000-000000000006";
const correctAttemptChallengeId = "aaaaaaaa-0007-4000-8000-000000000007";
const csrfHeaderName = "X-RegexRiddle-CSRF";
const csrfHeaderValue = "1";

function apiBaseUrl(): string {
  const apiPort = Number(process.env.API_PORT ?? 4000);

  return `http://127.0.0.1:${apiPort}`;
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

function expectNoSensitiveKeys(value: unknown, forbiddenValue?: string): void {
  const keys = collectKeys(value);

  for (const forbiddenKey of forbiddenResponseKeys) {
    expect(keys.has(forbiddenKey)).toBe(false);
  }

  if (forbiddenValue !== undefined) {
    expect(JSON.stringify(value)).not.toContain(forbiddenValue);
  }
}

function readSetCookieHeader(headers: Record<string, string>): string {
  const setCookie = headers["set-cookie"];

  expect(setCookie).toBeTruthy();

  return setCookie;
}

function readCookiePair(setCookie: string): string {
  return setCookie.split(";")[0] ?? "";
}

function readCookieValue(setCookie: string): string {
  const [, value] = readCookiePair(setCookie).split("=");

  return value ?? "";
}

async function cleanupE2EAttemptData(): Promise<void> {
  await prisma.solution.deleteMany({
    where: {
      userId: demoPlayerId,
      challengeId: { in: [attemptChallengeId, correctAttemptChallengeId] }
    }
  });
  await prisma.attempt.deleteMany({
    where: {
      userId: demoPlayerId,
      challengeId: { in: [attemptChallengeId, correctAttemptChallengeId] }
    }
  });
  await prisma.session.deleteMany({
    where: { userId: demoPlayerId }
  });
}

async function loginDemoPlayer(
  request: APIRequestContext
): Promise<{ cookie: string; sessionToken: string }> {
  const loginResponse = await request.post(`${apiBaseUrl()}/api/auth/login`, {
    data: {
      usernameOrEmail: "demo_player",
      password: "Password123!"
    }
  });

  expect(loginResponse.ok()).toBe(true);

  const setCookie = readSetCookieHeader(loginResponse.headers());

  return {
    cookie: readCookiePair(setCookie),
    sessionToken: readCookieValue(setCookie)
  };
}

test.beforeEach(async () => {
  await cleanupE2EAttemptData();
});

test.afterAll(async () => {
  await cleanupE2EAttemptData();
  await prisma.$disconnect();
});

test("web app renders the RegexRiddle scaffold", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "RegexRiddle" })).toBeVisible();
  await expect(page.getByText("RegexRiddle scaffold is running")).toBeVisible();
});

test("attempt API rejects unauthenticated submissions", async ({ request }) => {
  const response = await request.post(
    `${apiBaseUrl()}/api/challenges/${attemptChallengeId}/attempts`,
    {
      headers: {
        [csrfHeaderName]: csrfHeaderValue
      },
      data: {
        pattern: ".*",
        flags: ""
      }
    }
  );
  const body = await response.json();

  expect(response.status()).toBe(401);
  expect(body).toEqual({
    error: "Unauthorized",
    message: "Authentication required."
  });
  expectNoSensitiveKeys(body, ".*");
});

test("attempt API lets a demo user submit a wrong regex with aggregate counts only", async ({
  request
}) => {
  const { cookie, sessionToken } = await loginDemoPlayer(request);
  const response = await request.post(
    `${apiBaseUrl()}/api/challenges/${attemptChallengeId}/attempts`,
    {
      headers: {
        cookie,
        [csrfHeaderName]: csrfHeaderValue
      },
      data: {
        pattern: ".*",
        flags: ""
      }
    }
  );
  const body = (await response.json()) as AttemptSubmissionResponseBody;

  expect(response.status()).toBe(201);
  expect(body.solved).toBe(false);
  expect(body.attempt).toMatchObject({
    challengeId: attemptChallengeId,
    attemptNumber: 1,
    positiveMatched: 3,
    positiveTotal: 3,
    negativeMatched: 3,
    negativeTotal: 3,
    isCorrect: false
  });
  expectNoSensitiveKeys(body, ".*");
  expectNoSensitiveKeys(body, sessionToken);
});

test("attempt API lets a demo user submit a correct regex and solves the challenge", async ({
  request
}) => {
  const { cookie, sessionToken } = await loginDemoPlayer(request);
  const submittedPattern = String.raw`[A-Z]{2}\d{3}[A-Z]{2}`;
  const response = await request.post(
    `${apiBaseUrl()}/api/challenges/${correctAttemptChallengeId}/attempts`,
    {
      headers: {
        cookie,
        [csrfHeaderName]: csrfHeaderValue
      },
      data: {
        pattern: submittedPattern,
        flags: ""
      }
    }
  );
  const body = (await response.json()) as AttemptSubmissionResponseBody;

  expect(response.status()).toBe(201);
  expect(body.solved).toBe(true);
  expect(body.attempt).toMatchObject({
    challengeId: correctAttemptChallengeId,
    attemptNumber: 1,
    positiveMatched: 3,
    positiveTotal: 3,
    negativeMatched: 0,
    negativeTotal: 3,
    isCorrect: true
  });
  expectNoSensitiveKeys(body, submittedPattern);
  expectNoSensitiveKeys(body, sessionToken);
});

test("attempt API rejects an author attempting their own challenge", async ({
  request
}) => {
  const loginResponse = await request.post(`${apiBaseUrl()}/api/auth/login`, {
    data: {
      usernameOrEmail: "daniele_demo",
      password: "Password123!"
    }
  });
  const setCookie = readSetCookieHeader(loginResponse.headers());
  const response = await request.post(
    `${apiBaseUrl()}/api/challenges/${attemptChallengeId}/attempts`,
    {
      headers: {
        cookie: readCookiePair(setCookie),
        [csrfHeaderName]: csrfHeaderValue
      },
      data: {
        pattern: String.raw`[A-Z]{2}-\d{4}`,
        flags: ""
      }
    }
  );
  const body = await response.json();

  expect(response.status()).toBe(403);
  expect(body).toEqual({
    error: "Forbidden",
    message: "Authors cannot attempt their own challenges."
  });
  expectNoSensitiveKeys(body, String.raw`[A-Z]{2}-\d{4}`);
});

test("api health endpoint responds", async ({ request }) => {
  const apiPort = Number(process.env.API_PORT ?? 4000);
  const response = await request.get(`http://127.0.0.1:${apiPort}/health`);

  expect(response.ok()).toBe(true);
  const body = await response.json();

  expect(body).toMatchObject({
    status: "ok",
    service: "regexriddle-api",
    appName: "RegexRiddle"
  });
  expect(typeof body.environment).toBe("string");
});

test("public challenges API returns a safe catalog", async ({ request }) => {
  const apiPort = Number(process.env.API_PORT ?? 4000);
  const response = await request.get(
    `http://127.0.0.1:${apiPort}/api/challenges?limit=20&page=1`
  );

  expect(response.ok()).toBe(true);
  const body = await response.json();

  expect(body.items.length).toBeGreaterThan(0);
  expect(body.total).toBeGreaterThanOrEqual(10);
  expect(body.items.some((item: { title: string }) => item.title === "Solo cifre")).toBe(
    true
  );
  expectNoSensitiveKeys(body);
});

test("public challenge detail API returns safe detail", async ({ request }) => {
  const apiPort = Number(process.env.API_PORT ?? 4000);
  const response = await request.get(
    `http://127.0.0.1:${apiPort}/api/challenges/aaaaaaaa-0001-4000-8000-000000000001`
  );

  expect(response.ok()).toBe(true);
  const body = await response.json();

  expect(body.id).toBe("aaaaaaaa-0001-4000-8000-000000000001");
  expect(body.title).toBe("Solo cifre");
  expect(body.author).toHaveProperty("username");
  expect(body.author).toHaveProperty("displayName");
  expectNoSensitiveKeys(body);
});

test("auth API logs in a demo user and returns me", async ({ request }) => {
  const apiPort = Number(process.env.API_PORT ?? 4000);
  const loginResponse = await request.post(
    `http://127.0.0.1:${apiPort}/api/auth/login`,
    {
      data: {
        usernameOrEmail: "demo_player",
        password: "Password123!"
      }
    }
  );

  expect(loginResponse.ok()).toBe(true);
  const loginBody = (await loginResponse.json()) as AuthUserResponseBody;
  const setCookie = readSetCookieHeader(loginResponse.headers());
  const sessionToken = readCookieValue(setCookie);

  expect(loginBody.user.username).toBe("demo_player");
  expect(setCookie).toContain("HttpOnly");
  expect(setCookie).toContain("SameSite=Lax");
  expectNoSensitiveKeys(loginBody, sessionToken);

  const meResponse = await request.get(
    `http://127.0.0.1:${apiPort}/api/auth/me`,
    {
      headers: {
        cookie: readCookiePair(setCookie)
      }
    }
  );

  expect(meResponse.ok()).toBe(true);
  const meBody = (await meResponse.json()) as AuthUserResponseBody;

  expect(meBody.user.username).toBe("demo_player");
  expectNoSensitiveKeys(meBody, sessionToken);
});

test("auth API logs out and invalidates the session", async ({ request }) => {
  const apiPort = Number(process.env.API_PORT ?? 4000);
  const loginResponse = await request.post(
    `http://127.0.0.1:${apiPort}/api/auth/login`,
    {
      data: {
        usernameOrEmail: "demo_player",
        password: "Password123!"
      }
    }
  );
  const setCookie = readSetCookieHeader(loginResponse.headers());
  const logoutResponse = await request.post(
    `http://127.0.0.1:${apiPort}/api/auth/logout`,
    {
      headers: {
        cookie: readCookiePair(setCookie)
      }
    }
  );

  expect(logoutResponse.ok()).toBe(true);
  expect(readSetCookieHeader(logoutResponse.headers())).toContain("Max-Age=0");

  const meResponse = await request.get(
    `http://127.0.0.1:${apiPort}/api/auth/me`,
    {
      headers: {
        cookie: readCookiePair(setCookie)
      }
    }
  );

  expect(meResponse.status()).toBe(401);
});

test("auth API rejects invalid login generically", async ({ request }) => {
  const apiPort = Number(process.env.API_PORT ?? 4000);
  const response = await request.post(
    `http://127.0.0.1:${apiPort}/api/auth/login`,
    {
      data: {
        usernameOrEmail: "demo_player",
        password: "WrongPassword123!"
      }
    }
  );
  const body = await response.json();

  expect(response.status()).toBe(401);
  expect(body).toEqual({
    error: "Unauthorized",
    message: "Invalid credentials."
  });
  expectNoSensitiveKeys(body);
});

test("auth API responses do not expose sensitive auth data", async ({ request }) => {
  const apiPort = Number(process.env.API_PORT ?? 4000);
  const loginResponse = await request.post(
    `http://127.0.0.1:${apiPort}/api/auth/login`,
    {
      data: {
        usernameOrEmail: "demo_player@example.test",
        password: "Password123!"
      }
    }
  );
  const loginBody = await loginResponse.json();
  const setCookie = readSetCookieHeader(loginResponse.headers());
  const sessionToken = readCookieValue(setCookie);
  const meResponse = await request.get(
    `http://127.0.0.1:${apiPort}/api/auth/me`,
    {
      headers: {
        cookie: readCookiePair(setCookie)
      }
    }
  );
  const meBody = await meResponse.json();

  expect(loginResponse.ok()).toBe(true);
  expect(meResponse.ok()).toBe(true);
  expectNoSensitiveKeys(loginBody, sessionToken);
  expectNoSensitiveKeys(meBody, sessionToken);
});
