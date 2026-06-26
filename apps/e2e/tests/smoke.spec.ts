import { expect, test } from "@playwright/test";

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

test("web app renders the RegexRiddle scaffold", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "RegexRiddle" })).toBeVisible();
  await expect(page.getByText("RegexRiddle scaffold is running")).toBeVisible();
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
