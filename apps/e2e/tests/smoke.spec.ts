import { expect, test } from "@playwright/test";

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
