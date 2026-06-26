import { expect, test } from "@playwright/test";

const forbiddenResponseKeys = [
  "secretPattern",
  "controls",
  "value",
  "proposedPattern",
  "passwordHash",
  "sessionTokenHash"
];

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

function expectNoSensitiveKeys(value: unknown): void {
  const keys = collectKeys(value);

  for (const forbiddenKey of forbiddenResponseKeys) {
    expect(keys.has(forbiddenKey)).toBe(false);
  }
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
