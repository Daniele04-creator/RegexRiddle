import { expect, test, type Page } from "@playwright/test";

import {
  ATTEMPT_CHALLENGE_CONTROL_VALUES,
  CORRECT_CHALLENGE_CONTROL_VALUES,
  DEMO_CHALLENGE_IDS,
  DEMO_PASSWORD,
  DEMO_USERS
} from "../../backend/prisma/seed.js";

const registeredUsername = "e2e_studente";
const createdChallenge = {
  description: "Riconosci un CAP italiano composto da cinque cifre.",
  negativeControl: "ABCDE",
  negativeExample: "8012A",
  positiveControl: "00100",
  positiveExample: "80125",
  secretPattern: String.raw`\d{5}`,
  title: "CAP italiano E2E"
};

async function login(
  page: Page,
  username: string,
  password = DEMO_PASSWORD
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page
    .locator("form.auth-form")
    .getByRole("button", { name: "Accedi" })
    .click();

  await expect(page).toHaveURL(/\/challenges$/);
}

async function expectAuthenticatedNavigation(page: Page): Promise<void> {
  const navigation = page.getByRole("navigation", {
    name: "Navigazione principale"
  });

  await expect(
    navigation.getByRole("link", { exact: true, name: "Sfide" })
  ).toBeVisible();
  await expect(
    navigation.getByRole("link", { exact: true, name: "Classifica" })
  ).toBeVisible();
  await expect(navigation.getByRole("button", { name: "Esci" })).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  );

  expect(hasHorizontalOverflow).toBe(false);
}

async function fillChallengeForm(page: Page): Promise<void> {
  await page.getByLabel("Titolo").fill(createdChallenge.title);
  await page.getByLabel("Descrizione").fill(createdChallenge.description);
  await page.getByLabel("Regex segreta").fill(createdChallenge.secretPattern);
  await page
    .getByLabel("Esempio pubblico positivo")
    .fill(createdChallenge.positiveExample);
  await page
    .getByLabel("Esempio pubblico negativo")
    .fill(createdChallenge.negativeExample);
  await page
    .getByRole("textbox", { name: "Prova da accettare 1" })
    .fill(createdChallenge.positiveControl);
  await page
    .getByRole("textbox", { name: "Prova da rifiutare 1" })
    .fill(createdChallenge.negativeControl);
}

async function expectValuesNotRendered(
  page: Page,
  values: readonly string[]
): Promise<void> {
  const pageContent = await page.content();

  for (const value of values) {
    expect(pageContent).not.toContain(value);
  }
}

test.describe("Desktop", () => {
  test.use({ viewport: { height: 720, width: 1280 } });

  test("1. Un nuovo utente si registra e accede da desktop", async ({
    page
  }) => {
    await page.goto("/register");
    await page.getByLabel("Username").fill(registeredUsername);
    await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
    await page
      .locator("form.auth-form")
      .getByRole("button", { name: "Registrati" })
      .click();

    await expect(page).toHaveURL(/\/login\?registered=1$/);
    await expect(
      page.getByText(
        "Registrazione ricevuta. Ora puoi accedere con username e password."
      )
    ).toBeVisible();

    await login(page, registeredUsername);
    await expectAuthenticatedNavigation(page);
  });

  test("2. Un utente seed accede ed esegue il logout da desktop", async ({
    page
  }) => {
    await login(page, DEMO_USERS.chiara.username);
    await expectAuthenticatedNavigation(page);

    await page.route(
      "**/api/auth/logout",
      async (route) => {
        await route.fulfill({ status: 503 });
      },
      { times: 1 }
    );

    const failedLogout = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/auth/logout") &&
        response.request().method() === "POST"
    );

    await page.getByRole("button", { name: "Esci" }).click();
    expect((await failedLogout).status()).toBe(503);
    await expectAuthenticatedNavigation(page);

    await page.getByRole("button", { name: "Esci" }).click();

    await expect(
      page.getByRole("link", { exact: true, name: "Accedi" })
    ).toBeVisible();
  });

  test("3. Un utente crea una nuova sfida da desktop", async ({ page }) => {
    await login(page, DEMO_USERS.luca.username);
    await page.goto("/create");
    await fillChallengeForm(page);

    await page.getByRole("button", { name: "Pubblica sfida" }).click();

    await expect(
      page.getByRole("heading", { name: "Sfida pubblicata!" })
    ).toBeVisible();
    await expect(page.getByText("Sfida creata")).toBeVisible();
    await expect(page.getByText(createdChallenge.secretPattern)).toHaveCount(0);

    await page.getByRole("link", { name: "Apri sfida" }).click();

    await expect(
      page.getByRole("heading", { name: createdChallenge.title })
    ).toBeVisible();
    await expect(
      page.getByText(createdChallenge.positiveExample, { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(createdChallenge.negativeExample, { exact: true })
    ).toBeVisible();
    await expectValuesNotRendered(page, [
      createdChallenge.secretPattern,
      createdChallenge.positiveControl,
      createdChallenge.negativeControl
    ]);
  });

  test("4. Un utente invia una soluzione errata da desktop", async ({
    page
  }) => {
    await login(page, DEMO_USERS.luca.username);
    await page.goto(`/challenges/${DEMO_CHALLENGE_IDS.urlPath}`);

    await page.getByLabel("Regex candidata").fill(".*");
    await page.getByRole("button", { name: "Invia tentativo" }).click();

    const attempt = page.locator(".attempt-card").first();
    await expect(attempt.locator("summary")).toContainText("Tentativo #1");
    await expect(attempt.getByText("5/5")).toBeVisible();
    await expect(attempt.getByText("0/5")).toBeVisible();
    await expectValuesNotRendered(page, ATTEMPT_CHALLENGE_CONTROL_VALUES);
  });

  test("5. Un utente risolve una sfida da desktop", async ({ page }) => {
    await login(page, DEMO_USERS.luca.username);
    await page.goto(`/challenges/${DEMO_CHALLENGE_IDS.time24Hours}`);

    await page
      .getByLabel("Regex candidata")
      .fill(String.raw`(?:[01]\d|2[0-3]):[0-5]\d`);
    await page.getByRole("button", { name: "Invia tentativo" }).click();

    await expect(page.getByText("Soluzione corretta")).toBeVisible();
    await expect(page.getByText("Hai risolto la sfida.")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sfida risolta" })
    ).toBeDisabled();
    await expectValuesNotRendered(page, CORRECT_CHALLENGE_CONTROL_VALUES);
  });
});

test.describe("Mobile", () => {
  test.use({ viewport: { height: 844, width: 390 } });

  test("6. Un visitatore raggiunge il login da Come funziona su mobile", async ({
    page
  }) => {
    await page.goto("/how-it-works");
    await expectNoHorizontalOverflow(page);

    await page
      .locator("#main-content")
      .getByRole("link", { exact: true, name: "Accedi" })
      .click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Bentornato" })
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("7. Un utente accede e usa la navigazione mobile", async ({ page }) => {
    await login(page, DEMO_USERS.chiara.username);
    await expectAuthenticatedNavigation(page);
    await expectNoHorizontalOverflow(page);

    await page
      .getByRole("navigation", { name: "Navigazione principale" })
      .getByRole("link", { exact: true, name: "Classifica" })
      .click();

    await expect(page).toHaveURL(/\/leaderboard$/);
    await expect(
      page.getByRole("heading", { name: "Classifica" })
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("8. Un utente filtra e apre una sfida su mobile", async ({ page }) => {
    await login(page, DEMO_USERS.chiara.username);

    await page.getByRole("button", { name: "difficile" }).click();
    const challengeLink = page.getByRole("link", {
      name: /Numeri romani/
    });

    await expect(challengeLink).toBeVisible();
    await challengeLink.click();

    await expect(
      page.getByRole("heading", { name: "Numeri romani" })
    ).toBeVisible();
    await expect(page.getByText("MCMXCIX", { exact: true })).toBeVisible();
    await expect(page.getByText("IIII", { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("9. Un utente consulta profilo e classifica su mobile", async ({
    page
  }) => {
    await login(page, DEMO_USERS.chiara.username);
    await page.goto("/account");

    await expect(
      page.getByRole("heading", {
        name: `@${DEMO_USERS.chiara.username}`
      })
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/leaderboard");
    const mobileLeaderboard = page.locator(".mobile-leaderboard");

    await expect(
      mobileLeaderboard.getByText(`@${DEMO_USERS.davide.username}`)
    ).toBeVisible();
    await expect(
      mobileLeaderboard.getByText(`@${DEMO_USERS.chiara.username}`)
    ).toBeVisible();
    await expect(
      mobileLeaderboard.getByText(`@${DEMO_USERS.luca.username}`)
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("10. Un utente esegue il logout e viene protetto su mobile", async ({
    page
  }) => {
    await login(page, DEMO_USERS.chiara.username);

    await page.getByRole("button", { name: "Esci" }).click();
    await page.goto("/account");

    await expect(page).toHaveURL(/\/login\?returnUrl=%2Faccount$/);
    await expect(
      page.getByRole("heading", { name: "Bentornato" })
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
