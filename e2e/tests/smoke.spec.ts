import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

import { prisma } from "../../backend/src/db/prisma.js";

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
    bio: string | null;
    avatarUrl: string | null;
  };
}

type AccountUpdateResponseBody = AuthUserResponseBody;

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

interface ChallengeCreateResponseBody {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  author: {
    username: string;
    displayName: string;
  };
  publicPositiveExample: string;
  publicNegativeExample: string;
  stats: {
    attemptsTotal: number;
    solutionsTotal: number;
  };
}

interface LeaderboardResponseBody {
  items: Array<{
    rank: number;
    user: {
      username: string;
      displayName: string;
    };
    solvedCount: number;
    averageAttempts: number;
    totalAttemptsUsed: number;
  }>;
  page: number;
  limit: number;
  total: number;
}

const demoPlayerId = "22222222-2222-4222-8222-222222222222";
const demoPlayerDisplayName = "Demo Player";
const demoPlayerBio = "Demo solver account with solved and unsolved attempts.";
const attemptChallengeId = "aaaaaaaa-0006-4000-8000-000000000006";
const correctAttemptChallengeId = "aaaaaaaa-0007-4000-8000-000000000007";
const csrfHeaderName = "X-RegexRiddle-CSRF";
const csrfHeaderValue = "1";
const e2eChallengeTitlePrefix = "E2E Challenge Create";
const e2eAuthUsername = "e2e_auth_ui";
const e2eAuthEmail = "e2e_auth_ui@example.test";
const e2eAuthDisplayName = "E2E Auth UI";
const e2eLeaderboardUserPrefix = "e2e_lb_";
const e2eLeaderboardChallengeTitlePrefix = "E2E Leaderboard Challenge";
const e2eLeaderboardPasswordHash = "e2e-leaderboard-password-hash";
const forbiddenRenderedFrontendStrings = [
  "secretPattern",
  "ChallengeControl.value",
  "proposedPattern",
  "passwordHash",
  "sessionTokenHash",
  "rr_session="
];
const forbiddenAttemptChallengeControlValues = [
  "AA-0000",
  "ZX-9876",
  "RR-2026",
  "aa-0000",
  "AAA-0000"
];
const forbiddenCorrectChallengeControlValues = [
  "AA000AA",
  "ZZ999ZZ",
  "RG123EX",
  "AA00AA",
  "aa000aa",
  "AAA000A"
];

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

function expectNoLeaderboardSensitiveKeys(value: unknown): void {
  const keys = collectKeys(value);
  const forbiddenLeaderboardKeys = [
    "id",
    "email",
    "secretPattern",
    "controls",
    "value",
    "proposedPattern",
    "passwordHash",
    "sessionTokenHash",
    "token",
    "sessionToken"
  ];

  for (const forbiddenKey of forbiddenLeaderboardKeys) {
    expect(keys.has(forbiddenKey)).toBe(false);
  }
}

async function expectNoForbiddenRenderedFrontendStrings(pageContent: string): Promise<void> {
  for (const forbiddenString of forbiddenRenderedFrontendStrings) {
    expect(pageContent).not.toContain(forbiddenString);
  }
}

async function expectNoRenderedSeedControlValues(
  pageContent: string,
  values: string[]
): Promise<void> {
  for (const value of values) {
    expect(pageContent).not.toContain(value);
  }
}

async function expectNoAuthStorage(page: Page): Promise<void> {
  const storage = await page.evaluate(() => [
    ...Object.entries(window.localStorage),
    ...Object.entries(window.sessionStorage)
  ]);
  const serializedStorage = JSON.stringify(storage);

  expect(serializedStorage).not.toMatch(/auth|token|session|rr_session/i);
}

async function expectNoSecretStorage(
  page: Page,
  values: string[]
): Promise<void> {
  const storage = await page.evaluate(() => [
    ...Object.entries(window.localStorage),
    ...Object.entries(window.sessionStorage)
  ]);
  const serializedStorage = JSON.stringify(storage);

  for (const value of values) {
    expect(serializedStorage).not.toContain(value);
  }
}

async function loginDemoPlayerThroughUi(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Username o email").fill("demo_player");
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Accedi" }).click();

  await expect(page).toHaveURL(/\/challenges$/);
  if ((page.viewportSize()?.width ?? 1024) < 1024) {
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const mobileNavigation = page.getByRole("navigation", {
      name: "Mobile navigation"
    });
    await expect(mobileNavigation.getByText("Demo Player")).toBeVisible();
    await expect(mobileNavigation.getByText("@demo_player")).toBeVisible();
    await page.keyboard.press("Escape");
    return;
  }

  const banner = page.getByRole("banner");
  await expect(banner.getByText("Demo Player")).toBeVisible();
  await expect(banner.getByText("@demo_player")).toBeVisible();
}

async function loginDanieleThroughUi(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Username o email").fill("daniele_demo");
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Accedi" }).click();

  await expect(page).toHaveURL(/\/challenges$/);
  await expect(page.getByText("Daniele Demo").first()).toBeVisible();
  await expect(page.getByText("@daniele_demo").first()).toBeVisible();
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

async function resetDemoPlayerProfile(): Promise<void> {
  await prisma.user.update({
    where: { id: demoPlayerId },
    data: {
      avatarUrl: null,
      bio: demoPlayerBio,
      displayName: demoPlayerDisplayName
    }
  });
}

async function cleanupE2EChallengeCreateData(): Promise<void> {
  const challenges = await prisma.challenge.findMany({
    where: { title: { startsWith: e2eChallengeTitlePrefix } },
    select: { id: true }
  });
  const challengeIds = challenges.map((challenge) => challenge.id);

  await prisma.solution.deleteMany({
    where: { challengeId: { in: challengeIds } }
  });
  await prisma.attempt.deleteMany({
    where: { challengeId: { in: challengeIds } }
  });
  await prisma.challenge.deleteMany({
    where: { id: { in: challengeIds } }
  });
}

async function cleanupE2EAuthUiData(): Promise<void> {
  const users = await prisma.user.findMany({
    where: {
      OR: [{ username: e2eAuthUsername }, { email: e2eAuthEmail }]
    },
    select: { id: true }
  });
  const userIds = users.map((user) => user.id);

  await prisma.session.deleteMany({
    where: { userId: { in: userIds } }
  });
  await prisma.solution.deleteMany({
    where: { userId: { in: userIds } }
  });
  await prisma.attempt.deleteMany({
    where: { userId: { in: userIds } }
  });
  await prisma.user.deleteMany({
    where: { id: { in: userIds } }
  });
}

async function cleanupE2ELeaderboardData(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { username: { startsWith: e2eLeaderboardUserPrefix } },
    select: { id: true }
  });
  const userIds = users.map((user) => user.id);
  const challenges = await prisma.challenge.findMany({
    where: {
      OR: [
        { authorId: { in: userIds } },
        { title: { startsWith: e2eLeaderboardChallengeTitlePrefix } }
      ]
    },
    select: { id: true }
  });
  const challengeIds = challenges.map((challenge) => challenge.id);

  await prisma.solution.deleteMany({
    where: {
      OR: [
        { userId: { in: userIds } },
        { challengeId: { in: challengeIds } }
      ]
    }
  });
  await prisma.attempt.deleteMany({
    where: {
      OR: [
        { userId: { in: userIds } },
        { challengeId: { in: challengeIds } }
      ]
    }
  });
  await prisma.challenge.deleteMany({
    where: { id: { in: challengeIds } }
  });
  await prisma.session.deleteMany({
    where: { userId: { in: userIds } }
  });
  await prisma.user.deleteMany({
    where: { id: { in: userIds } }
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

function makeValidChallengeCreatePayload(suffix: string) {
  return {
    title: `${e2eChallengeTitlePrefix} ${suffix}`,
    description:
      "Create a regex that matches valid five-digit Italian postal codes.",
    difficulty: "EASY",
    secretPattern: String.raw`\d{5}`,
    flags: "",
    publicPositiveExample: "80125",
    publicNegativeExample: "8012A",
    controls: [
      { kind: "POSITIVE", value: "00100" },
      { kind: "POSITIVE", value: "20121" },
      { kind: "POSITIVE", value: "99999" },
      { kind: "NEGATIVE", value: "1234" },
      { kind: "NEGATIVE", value: "ABCDE" },
      { kind: "NEGATIVE", value: "123456" }
    ]
  };
}

async function fillChallengeCreateForm(
  page: Page,
  payload: ReturnType<typeof makeValidChallengeCreatePayload>
): Promise<void> {
  await page.getByLabel("Titolo").fill(payload.title);
  await page.getByLabel("Descrizione").fill(payload.description);
  await page.getByLabel("Regex segreta").fill(payload.secretPattern);
  await page.getByLabel("Esempio pubblico positivo").fill(
    payload.publicPositiveExample
  );
  await page.getByLabel("Esempio pubblico negativo").fill(
    payload.publicNegativeExample
  );

  const positiveControls = payload.controls.filter(
    (control) => control.kind === "POSITIVE"
  );
  const negativeControls = payload.controls.filter(
    (control) => control.kind === "NEGATIVE"
  );

  for (const [index, control] of positiveControls.entries()) {
    await page
      .getByRole("textbox", { name: `Prova da accettare ${index + 1}` })
      .fill(control.value);
  }

  for (const [index, control] of negativeControls.entries()) {
    await page
      .getByRole("textbox", { name: `Prova da rifiutare ${index + 1}` })
      .fill(control.value);
  }
}

async function createE2ELeaderboardUser(suffix: string): Promise<string> {
  const user = await prisma.user.create({
    data: {
      username: `${e2eLeaderboardUserPrefix}${suffix}`,
      email: `${e2eLeaderboardUserPrefix}${suffix}@example.test`,
      passwordHash: e2eLeaderboardPasswordHash,
      displayName: `E2E Leaderboard ${suffix}`
    },
    select: { id: true }
  });

  return user.id;
}

async function seedE2ELeaderboardData(): Promise<void> {
  const authorId = await createE2ELeaderboardUser("author");
  const alphaId = await createE2ELeaderboardUser("alpha");
  const betaId = await createE2ELeaderboardUser("beta");

  await createE2ELeaderboardUser("zero");

  const challenges = await Promise.all(
    [1, 2, 3, 4].map((index) =>
      prisma.challenge.create({
        data: {
          authorId,
          title: `${e2eLeaderboardChallengeTitlePrefix} ${index}`,
          description: "Challenge used only for deterministic E2E leaderboard tests.",
          difficulty: "EASY",
          secretPattern: String.raw`\d+`,
          flags: "",
          publicPositiveExample: "123",
          publicNegativeExample: "abc"
        },
        select: { id: true }
      })
    )
  );

  const [firstChallenge, secondChallenge, thirdChallenge, fourthChallenge] =
    challenges;

  await prisma.solution.createMany({
    data: [
      { userId: alphaId, challengeId: firstChallenge.id, attemptsUsed: 1 },
      { userId: alphaId, challengeId: secondChallenge.id, attemptsUsed: 2 },
      { userId: alphaId, challengeId: thirdChallenge.id, attemptsUsed: 2 },
      { userId: alphaId, challengeId: fourthChallenge.id, attemptsUsed: 3 },
      { userId: betaId, challengeId: firstChallenge.id, attemptsUsed: 1 },
      { userId: betaId, challengeId: secondChallenge.id, attemptsUsed: 1 }
    ]
  });
}

test.beforeEach(async () => {
  await cleanupE2EAuthUiData();
  await cleanupE2ELeaderboardData();
  await cleanupE2EChallengeCreateData();
  await cleanupE2EAttemptData();
  await resetDemoPlayerProfile();
});

test.afterAll(async () => {
  await cleanupE2EAuthUiData();
  await cleanupE2ELeaderboardData();
  await cleanupE2EChallengeCreateData();
  await cleanupE2EAttemptData();
  await resetDemoPlayerProfile();
  await prisma.$disconnect();
});

test("web app renders the Regex Lab landing foundation", async ({ page }) => {
  await page.goto("/");
  const main = page.locator("#main-content");

  await expect(
    page.getByRole("heading", { name: "Risolvi enigmi nascosti con una sola regex" })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Inizia una sfida/ })).toBeVisible();
  await expect(main.getByRole("link", { name: /Scopri come si gioca/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Guarda classifica/ })).toBeVisible();
  await expect(page.getByText("Puzzle preview")).toBeVisible();
});

test("how-it-works loads publicly and exposes demo CTAs", async ({ page }) => {
  await page.goto("/how-it-works");

  await expect(
    page.getByRole("heading", { name: "Cinque mosse per risolvere un enigma regex" })
  ).toBeVisible();
  await expect(page.getByText(/deve coprire tutta la stringa/i)).toBeVisible();
  await expect(page.getByText(/prove nascoste/i).first()).toBeVisible();
  await expect(page.getByText(/indizi numerici/i)).toBeVisible();
  await expect(page.getByText(/piu enigmi con meno tentativi/i)).toBeVisible();
  await expectNoForbiddenRenderedFrontendStrings(await page.content());

  await page.getByRole("link", { name: /Esplora sfide/ }).click();
  await expect(page).toHaveURL(/\/challenges$/);
  await expect(
    page.getByRole("heading", { name: "Scegli il tuo prossimo enigma" })
  ).toBeVisible();

  await page.goto("/how-it-works");
  await page.getByRole("link", { name: "Classifica solver" }).click();
  await expect(page).toHaveURL(/\/leaderboard$/);
  await expect(page.getByRole("heading", { name: "Classifica solver" })).toBeVisible();

  await page.goto("/how-it-works");
  await page.getByRole("link", { name: "Crea una sfida" }).click();
  await expect(page).toHaveURL(/\/create$/);
  await expect(page.getByText("Accedi per creare una sfida")).toBeVisible();
});

test("landing CTA navigates to the public challenge catalog", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: /Inizia una sfida/ }).click();

  await expect(page).toHaveURL(/\/challenges$/);
  await expect(
    page.getByRole("heading", { name: "Scegli il tuo prossimo enigma" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Slug URL" })).toBeVisible();
});

test("desktop SPA navigation reaches public read routes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const banner = page.getByRole("banner");
  const primaryNavigation = page.getByRole("navigation", {
    name: "Primary navigation"
  });

  await primaryNavigation.getByRole("link", { exact: true, name: "Come funziona" }).click();
  await expect(page).toHaveURL(/\/how-it-works$/);
  await expect(
    page.getByRole("heading", { name: "Cinque mosse per risolvere un enigma regex" })
  ).toBeVisible();

  await primaryNavigation.getByRole("link", { exact: true, name: "Sfide" }).click();
  await expect(page).toHaveURL(/\/challenges$/);
  await expect(
    page.getByRole("heading", { name: "Scegli il tuo prossimo enigma" })
  ).toBeVisible();

  await primaryNavigation.getByRole("link", { exact: true, name: "Classifica" }).click();
  await expect(page).toHaveURL(/\/leaderboard$/);
  await expect(page.getByRole("heading", { name: "Classifica solver" })).toBeVisible();

  await banner.getByRole("link", { exact: true, name: "Accedi" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Bentornato nel laboratorio" })).toBeVisible();

  await banner.getByRole("link", { exact: true, name: "Registrati" }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole("heading", { name: "Crea il tuo profilo solver" })).toBeVisible();

  await primaryNavigation.getByRole("link", { exact: true, name: "Crea" }).click();
  await expect(page).toHaveURL(/\/create$/);
  await expect(page.getByRole("heading", { name: "Crea una sfida" })).toBeVisible();
  await expect(page.getByText("Accedi per creare una sfida")).toBeVisible();
});

test("mobile navigation opens and routes to public pages", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();

  await expect(
    page.getByRole("link", { exact: true, name: "Come funziona" })
  ).toBeVisible();
  await expect(page.getByRole("link", { exact: true, name: "Crea" })).toBeVisible();

  await page.getByRole("link", { exact: true, name: "Come funziona" }).click();
  await expect(page).toHaveURL(/\/how-it-works$/);
  await expect(
    page.getByRole("heading", { name: "Cinque mosse per risolvere un enigma regex" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page.getByRole("link", { exact: true, name: "Classifica" }).click();
  await expect(page).toHaveURL(/\/leaderboard$/);
  await expect(page.getByRole("heading", { name: "Classifica solver" })).toBeVisible();
});

test("mobile navigation exposes guest and authenticated auth actions", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.getByRole("link", { exact: true, name: "Accedi" })).toBeVisible();
  await expect(
    page.getByRole("link", { exact: true, name: "Registrati" })
  ).toBeVisible();
  await page.getByRole("link", { exact: true, name: "Accedi" }).click();
  await page.getByLabel("Username o email").fill("demo_player");
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Accedi" }).click();

  await expect(page).toHaveURL(/\/challenges$/);
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" })
  ).toContainText("Demo Player");
  await expect(page.getByRole("link", { exact: true, name: "Account" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
});

test("login form rejects invalid credentials generically", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Bentornato nel laboratorio" })).toBeVisible();
  await expect(page.getByLabel("Username o email")).toBeVisible();
  await expect(page.getByLabel("Password")).toHaveAttribute("type", "password");

  await page.getByLabel("Username o email").fill("demo_player");
  await page.getByLabel("Password").fill("WrongPassword123!");
  await page.getByRole("button", { name: "Accedi" }).click();

  await expect(page.getByText("Credenziali non valide.")).toBeVisible();
  await expect(page.getByText("Invalid credentials.")).toHaveCount(0);
  await expectNoForbiddenRenderedFrontendStrings(await page.content());
});

test("login restores current session in UI and logout clears it", async ({
  page
}) => {
  await loginDemoPlayerThroughUi(page);
  await expectNoAuthStorage(page);
  await expectNoForbiddenRenderedFrontendStrings(await page.content());

  await page.getByRole("button", { name: "Logout" }).click();

  await expect(page.getByRole("link", { exact: true, name: "Accedi" })).toBeVisible();
  await expect(page.getByText("Demo Player")).toHaveCount(0);
  await expectNoAuthStorage(page);
});

test("logged-out account page shows login and register gate", async ({ page }) => {
  await page.goto("/account");
  const main = page.locator("#main-content");

  await expect(
    page.getByRole("heading", { name: "Impostazioni account" })
  ).toBeVisible();
  await expect(page.getByText("Accedi per gestire l'account")).toBeVisible();
  await expect(main.getByRole("link", { exact: true, name: "Accedi" })).toHaveAttribute(
    "href",
    "/login"
  );
  await expect(
    main.getByRole("link", { exact: true, name: "Registrati" })
  ).toHaveAttribute("href", "/register");
  await expectNoAuthStorage(page);
});

test("authenticated account page updates profile and remains leak-free", async ({
  page
}) => {
  await loginDemoPlayerThroughUi(page);
  await page.goto("/account");

  await expect(page.getByLabel("Nome visibile")).toHaveValue("Demo Player");
  await expect(page.getByLabel("Bio")).toHaveValue(demoPlayerBio);
  await expect(page.getByLabel("Avatar URL")).toHaveValue("");

  await page.getByLabel("Nome visibile").fill("E2E Account Player");
  await page
    .getByLabel("Bio")
    .fill("Profilo demo aggiornato per il goal 08.5.");
  await page
    .getByLabel("Avatar URL")
    .fill("https://example.com/e2e-avatar.png");
  await page.getByRole("button", { name: "Salva impostazioni" }).click();

  await expect(page.getByText("Impostazioni account aggiornate.")).toBeVisible();
  await expect(page.getByText("E2E Account Player").first()).toBeVisible();
  await expect(page.getByText("Profilo demo aggiornato per il goal 08.5.")).toBeVisible();
  await expect(page.getByText("demo_player@example.test")).toBeVisible();
  await expectNoForbiddenRenderedFrontendStrings(await page.content());
  await expectNoAuthStorage(page);
  await expectNoSecretStorage(page, [
    ...forbiddenAttemptChallengeControlValues,
    ...forbiddenCorrectChallengeControlValues
  ]);

  await page.getByRole("button", { name: "Logout" }).click();
  await page.goto("/account");

  await expect(page.getByText("Accedi per gestire l'account")).toBeVisible();
  await expectNoAuthStorage(page);
});

test("mobile how-it-works and account stay within the viewport", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/how-it-works");

  await expect(
    page.getByRole("heading", { name: "Cinque mosse per risolvere un enigma regex" })
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
  ).toBe(false);

  await loginDemoPlayerThroughUi(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/account");

  await expect(page.getByLabel("Nome visibile")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
  ).toBe(false);
  await expectNoAuthStorage(page);
});

test("registration validates passwords and logs in a new deterministic user", async ({
  page
}) => {
  await page.goto("/register");

  await expect(page.getByRole("heading", { name: "Crea il tuo profilo solver" })).toBeVisible();
  await page.getByLabel("Username").fill(e2eAuthUsername);
  await page.getByLabel("Email").fill(e2eAuthEmail);
  await page.getByLabel("Nome visibile").fill(e2eAuthDisplayName);
  await page.getByLabel("Password", { exact: true }).fill("Password123!");
  await page.getByLabel("Conferma password").fill("Password124!");
  await page.getByRole("button", { name: "Registrati" }).click();

  await expect(page.getByText("Le password non coincidono.")).toBeVisible();
  await expect(page).toHaveURL(/\/register$/);

  await page.getByLabel("Conferma password").fill("Password123!");
  await page.getByRole("button", { name: "Registrati" }).click();

  await expect(page).toHaveURL(/\/challenges$/);
  await expect(page.getByText(e2eAuthDisplayName).first()).toBeVisible();
  await expect(page.getByText(`@${e2eAuthUsername}`).first()).toBeVisible();
  await expectNoAuthStorage(page);
  await expectNoForbiddenRenderedFrontendStrings(await page.content());
});

test("registration conflict shows a friendly error", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Username").fill("demo_player");
  await page.getByLabel("Email").fill("demo_player@example.test");
  await page.getByLabel("Nome visibile").fill("Duplicate Demo Player");
  await page.getByLabel("Password", { exact: true }).fill("Password123!");
  await page.getByLabel("Conferma password").fill("Password123!");
  await page.getByRole("button", { name: "Registrati" }).click();

  await expect(page.getByText("Username o email gia in uso.")).toBeVisible();
  await expect(page.getByText("Username or email already exists.")).toHaveCount(0);
  await expectNoForbiddenRenderedFrontendStrings(await page.content());
});

test("create route asks guests to authenticate without rendering authoring fields", async ({
  page
}) => {
  await page.goto("/create");

  await expect(page.getByText("Accedi per creare una sfida")).toBeVisible();
  await expect(page.getByLabel("Regex segreta")).toHaveCount(0);
  await expectNoForbiddenRenderedFrontendStrings(await page.content());
});

test("authenticated user sees the protected challenge creation form", async ({
  page
}) => {
  await loginDemoPlayerThroughUi(page);
  await page.goto("/create");

  await expect(page.getByRole("heading", { name: "Crea una sfida" })).toBeVisible();
  await expect(page.getByLabel("Titolo")).toBeVisible();
  await expect(page.getByLabel("Regex segreta")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pubblica sfida" })).toBeEnabled();
  await expect(page.getByText("Demo Player").first()).toBeVisible();
  await expectNoAuthStorage(page);
});

test("challenge creation UI blocks dropping below the minimum secret controls", async ({
  page
}) => {
  await loginDemoPlayerThroughUi(page);
  await page.goto("/create");

  const positiveRemoveButtons = page.getByRole("button", {
    name: /Rimuovi prova da accettare/
  });

  await expect(positiveRemoveButtons).toHaveCount(3);
  await expect(positiveRemoveButtons.first()).toBeDisabled();

  await page.getByRole("button", { name: "Aggiungi prova accettata" }).click();
  await expect(positiveRemoveButtons).toHaveCount(4);
  await expect(positiveRemoveButtons.nth(3)).toBeEnabled();

  await positiveRemoveButtons.nth(3).click();
  await expect(positiveRemoveButtons).toHaveCount(3);
  await expect(positiveRemoveButtons.first()).toBeDisabled();
  await expectNoAuthStorage(page);
});

test("challenge creation UI reports incoherence safely", async ({
  page
}) => {
  await loginDemoPlayerThroughUi(page);
  await page.goto("/create");

  const payload = {
    ...makeValidChallengeCreatePayload("frontend-incoherent"),
    publicPositiveExample: "ABCDE"
  };

  await fillChallengeCreateForm(page, payload);
  await page.getByRole("button", { name: "Pubblica sfida" }).click();

  await expect(
    page.getByText(
      "La soluzione, gli indizi o le prove nascoste non sono coerenti."
    )
  ).toBeVisible();
  await expect(
    page.getByText("Challenge examples or controls do not match the secret regex.")
  ).toHaveCount(0);
  await expectNoAuthStorage(page);
  await expectNoSecretStorage(page, [
    payload.secretPattern,
    ...payload.controls.map((control) => control.value)
  ]);
});

test("challenge creation UI creates a challenge and public pages stay secret-free", async ({
  page
}) => {
  await loginDemoPlayerThroughUi(page);
  await page.goto("/create");

  const payload = makeValidChallengeCreatePayload("frontend-valid");

  await fillChallengeCreateForm(page, payload);
  await page.getByRole("button", { name: "Pubblica sfida" }).click();

  await expect(page.getByText("Sfida creata")).toBeVisible();
  await expect(page.getByLabel("Regex segreta")).toHaveValue("");
  await expect(page.getByText(payload.secretPattern)).toHaveCount(0);
  await expectNoAuthStorage(page);
  await expectNoSecretStorage(page, [
    payload.secretPattern,
    ...payload.controls.map((control) => control.value)
  ]);

  await page.getByRole("link", { name: "Apri sfida" }).click();

  await expect(page).toHaveURL(/\/challenges\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name: payload.title })).toBeVisible();
  await expect(page.getByText(payload.publicPositiveExample)).toBeVisible();
  await expect(page.getByText(payload.publicNegativeExample)).toBeVisible();
  await expect(page.getByText(payload.secretPattern)).toHaveCount(0);
  for (const control of payload.controls) {
    await expect(page.getByText(control.value)).toHaveCount(0);
  }
  await expectNoForbiddenRenderedFrontendStrings(await page.content());

  await page.goto("/challenges");

  await expect(page.getByRole("heading", { name: payload.title })).toBeVisible();
  await expectNoForbiddenRenderedFrontendStrings(await page.content());
});

test("mobile challenge creation form avoids horizontal overflow", async ({
  page
}) => {
  await loginDemoPlayerThroughUi(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/create");

  await expect(page.getByRole("heading", { name: "Crea una sfida" })).toBeVisible();
  await page.getByRole("button", { name: "Aggiungi prova accettata" }).click();
  await page
    .getByRole("textbox", { name: "Prova da accettare 4" })
    .fill("123456789012345678901234567890");

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
  ).toBe(false);
  await expectNoAuthStorage(page);
});

test("public challenge catalog renders puzzle cards with public examples and stats", async ({
  page
}) => {
  await page.goto("/challenges");

  await expect(
    page.getByRole("heading", { name: "Scegli il tuo prossimo enigma" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Slug URL" })).toBeVisible();
  await expect(page.getByText("regex-riddle-2026")).toBeVisible();
  await expect(page.getByText("-regex-riddle")).toBeVisible();
  await expect(page.getByText("0 tentativi").first()).toBeVisible();
  await expect(page.getByText("0 soluzioni").first()).toBeVisible();
});

test("challenge card opens public detail without leaking secret fields", async ({
  page
}) => {
  await page.goto("/challenges");

  const slugCard = page.locator('[data-slot="card"]').filter({ hasText: "Slug URL" });
  await slugCard.getByRole("link", { name: /Gioca/ }).click();

  await expect(page).toHaveURL(/\/challenges\/aaaaaaaa-0010-4000-8000-000000000010$/);
  await expect(page.getByRole("heading", { name: "Slug URL" })).toBeVisible();
  await expect(page.getByText("regex-riddle-2026")).toBeVisible();
  await expect(page.getByText("-regex-riddle")).toBeVisible();
  await expect(page.getByText("Accedi per salvare il tentativo")).toBeVisible();
  await expect(page.getByRole("link", { exact: true, name: "Accedi" }).first()).toBeVisible();
  await expectNoForbiddenRenderedFrontendStrings(await page.content());
});

test("logged-out challenge detail shows the attempt login gate", async ({ page }) => {
  await page.goto(`/challenges/${attemptChallengeId}`);

  await expect(page.getByRole("heading", { name: "Codice prodotto" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Prova a risolvere" })).toBeVisible();
  await expect(page.getByText("Accedi per salvare il tentativo")).toBeVisible();
  await expect(
    page.getByRole("link", { exact: true, name: "Registrati" }).first()
  ).toBeVisible();
  await expect(page.getByLabel("Regex candidata")).toHaveCount(0);
  await expectNoForbiddenRenderedFrontendStrings(await page.content());
});

test("authenticated non-author sees the attempt form", async ({ page }) => {
  await loginDemoPlayerThroughUi(page);
  await page.goto(`/challenges/${attemptChallengeId}`);

  await expect(page.getByRole("heading", { name: "Codice prodotto" })).toBeVisible();
  await expect(page.getByLabel("Regex candidata")).toBeVisible();
  await expect(page.getByRole("checkbox", { exact: true, name: "i" })).toBeVisible();
  await expect(page.getByRole("checkbox", { exact: true, name: "m" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Invia tentativo" })).toBeEnabled();
  await expectNoAuthStorage(page);
  await expectNoForbiddenRenderedFrontendStrings(await page.content());
});

test("attempt UI shows safe invalid-regex feedback", async ({ page }) => {
  await loginDemoPlayerThroughUi(page);
  await page.goto(`/challenges/${attemptChallengeId}`);

  await page.getByLabel("Regex candidata").fill("(?=a)");
  await page.getByRole("button", { name: "Invia tentativo" }).click();

  await expect(
    page.getByText("Regex non valida per questo enigma.")
  ).toBeVisible();
  await expect(page.getByText("Submitted regex is invalid or unsupported.")).toHaveCount(
    0
  );
  await expectNoForbiddenRenderedFrontendStrings(await page.content());
});

test("attempt UI renders incorrect aggregate feedback only", async ({ page }) => {
  await loginDemoPlayerThroughUi(page);
  await page.goto(`/challenges/${attemptChallengeId}`);

  await page.getByLabel("Regex candidata").fill(".*");
  await page.getByRole("button", { name: "Invia tentativo" }).click();

  await expect(page.getByText("Non ancora")).toBeVisible();
  await expect(
    page.getByText(
      "Hai superato 3 prove utili su 3; restano 3 falsi positivi da eliminare su 3."
    )
  ).toBeVisible();
  const content = await page.content();
  await expectNoForbiddenRenderedFrontendStrings(content);
  await expectNoRenderedSeedControlValues(content, forbiddenAttemptChallengeControlValues);
  await expectNoAuthStorage(page);
});

test("attempt UI renders solved state and disables repeated submissions", async ({
  page
}) => {
  await loginDemoPlayerThroughUi(page);
  await page.goto(`/challenges/${correctAttemptChallengeId}`);

  await page.getByLabel("Regex candidata").fill(String.raw`[A-Z]{2}\d{3}[A-Z]{2}`);
  await page.getByRole("button", { name: "Invia tentativo" }).click();

  await expect(page.getByText("Soluzione corretta")).toBeVisible();
  await expect(page.getByText("Hai risolto la sfida. La classifica ti aspetta.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sfida risolta" })).toBeDisabled();
  await expect(page.getByText("1 tentativo")).toBeVisible();
  await expect(page.getByText("1 soluzione")).toBeVisible();
  const content = await page.content();
  await expectNoForbiddenRenderedFrontendStrings(content);
  await expectNoRenderedSeedControlValues(content, forbiddenCorrectChallengeControlValues);
  await expectNoAuthStorage(page);
});

test("challenge author sees the author-blocked attempt state", async ({ page }) => {
  await loginDanieleThroughUi(page);
  await page.goto(`/challenges/${attemptChallengeId}`);

  await expect(page.getByText("Sei l'autore di questa sfida")).toBeVisible();
  await expect(
    page.getByText("Gli autori non possono risolvere le proprie sfide.")
  ).toBeVisible();
  await expect(page.getByLabel("Regex candidata")).toHaveCount(0);
  await expectNoForbiddenRenderedFrontendStrings(await page.content());
});

test("mobile attempt panel and feedback avoid horizontal overflow", async ({ page }) => {
  await loginDemoPlayerThroughUi(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/challenges/${attemptChallengeId}`);

  await expect(page.getByRole("heading", { name: "Codice prodotto" })).toBeVisible();
  await expect(page.getByLabel("Regex candidata")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
  ).toBe(false);

  await page.getByLabel("Regex candidata").fill(".*");
  await page.getByRole("button", { name: "Invia tentativo" }).click();

  await expect(page.getByText("Non ancora")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
  ).toBe(false);
  await expectNoAuthStorage(page);
});

test("desktop and tablet attempt states avoid horizontal overflow", async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/challenges/${attemptChallengeId}`);

  await expect(page.getByText("Accedi per salvare il tentativo")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
  ).toBe(false);

  await loginDemoPlayerThroughUi(page);
  await page.goto(`/challenges/${attemptChallengeId}`);

  await expect(page.getByLabel("Regex candidata")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
  ).toBe(false);

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`/challenges/${attemptChallengeId}`);
  await page.getByLabel("Regex candidata").fill("(?=a)");
  await page.getByRole("button", { name: "Invia tentativo" }).click();

  await expect(
    page.getByText("Regex non valida per questo enigma.")
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
  ).toBe(false);
  await expectNoAuthStorage(page);
});

test("public leaderboard renders aggregate solver metrics only", async ({ page }) => {
  await page.goto("/leaderboard");

  await expect(page.getByRole("heading", { name: "Classifica solver" })).toBeVisible();
  await expect(page.getByText("Daniele Demo").first()).toBeVisible();
  await expect(page.getByText("@daniele_demo").first()).toBeVisible();
  await expect(page.getByText("#1").first()).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Sfide risolte" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Media tentativi" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Tentativi totali" })).toBeVisible();
  await expect(page.getByText("demo_player@example.test")).toHaveCount(0);
  await expectNoForbiddenRenderedFrontendStrings(await page.content());
});

test("catalog pagination supports keyboard and click navigation", async ({
  page
}) => {
  await page.goto("/challenges");

  await expect(page.getByRole("heading", { name: "Slug URL" })).toBeVisible();
  await page.getByRole("button", { name: /Successiva/ }).focus();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/challenges\?page=2$/);
  await expect(page.getByRole("heading", { name: "Solo cifre" })).toBeVisible();

  await page.getByRole("button", { name: /Precedente/ }).click();
  await expect(page).toHaveURL(/\/challenges$/);
});

test("mobile catalog and leaderboard stay readable without horizontal overflow", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/challenges");

  await expect(
    page.getByRole("heading", { name: "Scegli il tuo prossimo enigma" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Slug URL" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
  ).toBe(false);

  await page.goto("/leaderboard");

  await expect(page.getByRole("heading", { name: "Classifica solver" })).toBeVisible();
  await expect(page.getByText("Risolte", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Media", { exact: true }).first()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
  ).toBe(false);
});

test("frontend proxy exposes health through same-origin path", async ({ page }) => {
  const response = await page.request.get("/health");
  const body = await response.json();

  expect(response.ok()).toBe(true);
  expect(body).toMatchObject({
    status: "ok",
    service: "regexriddle-api",
    appName: "RegexRiddle"
  });
});

test("rendered frontend shell does not leak sensitive field names or auth tokens", async ({
  page
}) => {
  for (const path of [
    "/",
    "/how-it-works",
    "/challenges",
    "/challenges/aaaaaaaa-0010-4000-8000-000000000010",
    "/leaderboard",
    "/login",
    "/register",
    "/create",
    "/account"
  ]) {
    await page.goto(path);
    await expectNoForbiddenRenderedFrontendStrings(await page.content());
  }

  await expectNoAuthStorage(page);
  await loginDemoPlayerThroughUi(page);
  await expectNoAuthStorage(page);
  await page.getByRole("button", { name: "Logout" }).click();
  await expectNoAuthStorage(page);
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

test("challenge creation API lets a demo user create a valid challenge", async ({
  request
}) => {
  const { cookie, sessionToken } = await loginDemoPlayer(request);
  const payload = makeValidChallengeCreatePayload("valid");
  const response = await request.post(`${apiBaseUrl()}/api/challenges`, {
    headers: {
      cookie,
      [csrfHeaderName]: csrfHeaderValue
    },
    data: payload
  });
  const body = (await response.json()) as ChallengeCreateResponseBody;
  const storedChallenge = await prisma.challenge.findUnique({
    where: { id: body.id },
    select: { authorId: true }
  });

  expect(response.status()).toBe(201);
  expect(response.headers().location).toBe(`/api/challenges/${body.id}`);
  expect(body).toMatchObject({
    title: payload.title,
    difficulty: "EASY",
    author: {
      username: "demo_player"
    },
    publicPositiveExample: payload.publicPositiveExample,
    publicNegativeExample: payload.publicNegativeExample,
    stats: {
      attemptsTotal: 0,
      solutionsTotal: 0
    }
  });
  expect(storedChallenge?.authorId).toBe(demoPlayerId);
  expectNoSensitiveKeys(body, payload.secretPattern);
  expectNoSensitiveKeys(body, sessionToken);
  for (const control of payload.controls) {
    expectNoSensitiveKeys(body, control.value);
  }
});

test("public detail for a created challenge does not expose secrets or controls", async ({
  request
}) => {
  const { cookie } = await loginDemoPlayer(request);
  const payload = makeValidChallengeCreatePayload("detail-antileak");
  const createResponse = await request.post(`${apiBaseUrl()}/api/challenges`, {
    headers: {
      cookie,
      [csrfHeaderName]: csrfHeaderValue
    },
    data: payload
  });
  const created = (await createResponse.json()) as ChallengeCreateResponseBody;
  const detailResponse = await request.get(
    `${apiBaseUrl()}/api/challenges/${created.id}`
  );
  const detail = await detailResponse.json();

  expect(createResponse.status()).toBe(201);
  expect(detailResponse.ok()).toBe(true);
  expect(detail.id).toBe(created.id);
  expectNoSensitiveKeys(detail, payload.secretPattern);
  for (const control of payload.controls) {
    expectNoSensitiveKeys(detail, control.value);
  }
});

test("challenge creation API rejects unauthenticated requests", async ({
  request
}) => {
  const payload = makeValidChallengeCreatePayload("unauthenticated");
  const response = await request.post(`${apiBaseUrl()}/api/challenges`, {
    headers: {
      [csrfHeaderName]: csrfHeaderValue
    },
    data: payload
  });
  const body = await response.json();

  expect(response.status()).toBe(401);
  expect(body).toEqual({
    error: "Unauthorized",
    message: "Authentication required."
  });
  expectNoSensitiveKeys(body, payload.secretPattern);
});

test("challenge creation API rejects missing CSRF", async ({ request }) => {
  const { cookie, sessionToken } = await loginDemoPlayer(request);
  const payload = makeValidChallengeCreatePayload("missing-csrf");
  const response = await request.post(`${apiBaseUrl()}/api/challenges`, {
    headers: {
      cookie
    },
    data: payload
  });
  const body = await response.json();

  expect(response.status()).toBe(403);
  expect(body).toEqual({
    error: "Forbidden",
    message: "CSRF header is required."
  });
  expectNoSensitiveKeys(body, payload.secretPattern);
  expectNoSensitiveKeys(body, sessionToken);
});

test("challenge creation API rejects incoherent controls without leaking secrets", async ({
  request
}) => {
  const { cookie, sessionToken } = await loginDemoPlayer(request);
  const payload = {
    ...makeValidChallengeCreatePayload("incoherent-controls"),
    controls: [
      { kind: "POSITIVE", value: "00100" },
      { kind: "POSITIVE", value: "20121" },
      { kind: "POSITIVE", value: "ABCDE" },
      { kind: "NEGATIVE", value: "1234" },
      { kind: "NEGATIVE", value: "ZZ999" },
      { kind: "NEGATIVE", value: "123456" }
    ]
  };
  const response = await request.post(`${apiBaseUrl()}/api/challenges`, {
    headers: {
      cookie,
      [csrfHeaderName]: csrfHeaderValue
    },
    data: payload
  });
  const body = await response.json();
  const persistedCount = await prisma.challenge.count({
    where: { title: payload.title }
  });

  expect(response.status()).toBe(422);
  expect(persistedCount).toBe(0);
  expectNoSensitiveKeys(body, payload.secretPattern);
  expectNoSensitiveKeys(body, "ABCDE");
  expectNoSensitiveKeys(body, sessionToken);
});

test("public leaderboard API returns a safe leaderboard", async ({ request }) => {
  await seedE2ELeaderboardData();

  const response = await request.get(`${apiBaseUrl()}/api/leaderboard?limit=50&page=1`);
  const body = (await response.json()) as LeaderboardResponseBody;
  const alpha = body.items.find(
    (item) => item.user.username === `${e2eLeaderboardUserPrefix}alpha`
  );

  expect(response.ok()).toBe(true);
  expect(body.page).toBe(1);
  expect(body.limit).toBe(50);
  expect(body.total).toBeGreaterThanOrEqual(2);
  expect(alpha).toMatchObject({
    user: {
      username: `${e2eLeaderboardUserPrefix}alpha`,
      displayName: "E2E Leaderboard alpha"
    },
    solvedCount: 4,
    averageAttempts: 2,
    totalAttemptsUsed: 8
  });
  expectNoLeaderboardSensitiveKeys(body);
});

test("leaderboard API supports pagination and rejects invalid query", async ({
  request
}) => {
  await seedE2ELeaderboardData();

  const pageResponse = await request.get(`${apiBaseUrl()}/api/leaderboard?limit=1&page=1`);
  const pageBody = (await pageResponse.json()) as LeaderboardResponseBody;
  const unknownQueryResponse = await request.get(
    `${apiBaseUrl()}/api/leaderboard?include=users`
  );
  const invalidPageResponse = await request.get(
    `${apiBaseUrl()}/api/leaderboard?page=0`
  );

  expect(pageResponse.ok()).toBe(true);
  expect(pageBody.page).toBe(1);
  expect(pageBody.limit).toBe(1);
  expect(pageBody.items).toHaveLength(1);
  expect(pageBody.items[0]?.rank).toBe(1);
  expect(unknownQueryResponse.status()).toBe(400);
  expect(invalidPageResponse.status()).toBe(400);
});

test("leaderboard API response does not leak forbidden data", async ({
  request
}) => {
  await seedE2ELeaderboardData();

  const response = await request.get(`${apiBaseUrl()}/api/leaderboard?limit=50&page=1`);
  const body = await response.json();
  const bodyText = JSON.stringify(body);

  expect(response.ok()).toBe(true);
  expectNoLeaderboardSensitiveKeys(body);
  expect(bodyText).not.toContain("@example.test");
  expect(bodyText).not.toContain(e2eLeaderboardPasswordHash);
  expect(bodyText).not.toContain(String.raw`\d+`);
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
  expect(meBody.user.bio).toBe(demoPlayerBio);
  expect(meBody.user.avatarUrl).toBeNull();
  expectNoSensitiveKeys(meBody, sessionToken);
});

test("account API rejects unauthenticated and missing CSRF updates", async ({
  request
}) => {
  const unauthenticatedResponse = await request.patch(
    `${apiBaseUrl()}/api/auth/me`,
    {
      headers: {
        [csrfHeaderName]: csrfHeaderValue
      },
      data: {
        displayName: "No Session"
      }
    }
  );
  const unauthenticatedBody = await unauthenticatedResponse.json();
  const { cookie, sessionToken } = await loginDemoPlayer(request);
  const missingCsrfResponse = await request.patch(`${apiBaseUrl()}/api/auth/me`, {
    headers: {
      cookie
    },
    data: {
      displayName: "No CSRF"
    }
  });
  const missingCsrfBody = await missingCsrfResponse.json();

  expect(unauthenticatedResponse.status()).toBe(401);
  expect(unauthenticatedBody).toEqual({
    error: "Unauthorized",
    message: "Authentication required."
  });
  expect(missingCsrfResponse.status()).toBe(403);
  expect(missingCsrfBody).toEqual({
    error: "Forbidden",
    message: "CSRF header is required."
  });
  expectNoSensitiveKeys(unauthenticatedBody);
  expectNoSensitiveKeys(missingCsrfBody, sessionToken);
});

test("account API updates only allowed current-user fields", async ({
  request
}) => {
  const { cookie, sessionToken } = await loginDemoPlayer(request);
  const response = await request.patch(`${apiBaseUrl()}/api/auth/me`, {
    headers: {
      cookie,
      [csrfHeaderName]: csrfHeaderValue
    },
    data: {
      displayName: "E2E API Player",
      bio: "Account API profile update.",
      avatarUrl: "https://example.com/api-avatar.png"
    }
  });
  const body = (await response.json()) as AccountUpdateResponseBody;
  const storedUser = await prisma.user.findUnique({
    where: { id: demoPlayerId },
    select: {
      avatarUrl: true,
      bio: true,
      displayName: true,
      email: true,
      username: true
    }
  });

  expect(response.status()).toBe(200);
  expect(body.user).toMatchObject({
    username: "demo_player",
    email: "demo_player@example.test",
    displayName: "E2E API Player",
    bio: "Account API profile update.",
    avatarUrl: "https://example.com/api-avatar.png"
  });
  expect(storedUser).toEqual({
    username: "demo_player",
    email: "demo_player@example.test",
    displayName: "E2E API Player",
    bio: "Account API profile update.",
    avatarUrl: "https://example.com/api-avatar.png"
  });
  expectNoSensitiveKeys(body, sessionToken);
});

test("account API rejects invalid avatar and mass-assignment keys", async ({
  request
}) => {
  const { cookie } = await loginDemoPlayer(request);
  const invalidAvatarResponse = await request.patch(`${apiBaseUrl()}/api/auth/me`, {
    headers: {
      cookie,
      [csrfHeaderName]: csrfHeaderValue
    },
    data: {
      avatarUrl: "ftp://example.com/avatar.png"
    }
  });
  const invalidAvatarBody = await invalidAvatarResponse.json();
  const massAssignmentResponse = await request.patch(`${apiBaseUrl()}/api/auth/me`, {
    headers: {
      cookie,
      [csrfHeaderName]: csrfHeaderValue
    },
    data: {
      displayName: "Mass Assignment",
      email: "attacker@example.test"
    }
  });
  const massAssignmentBody = await massAssignmentResponse.json();

  expect(invalidAvatarResponse.status()).toBe(400);
  expect(massAssignmentResponse.status()).toBe(400);
  expectNoSensitiveKeys(invalidAvatarBody, "ftp://example.com/avatar.png");
  expectNoSensitiveKeys(massAssignmentBody, "attacker@example.test");
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
