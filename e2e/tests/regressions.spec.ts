import { randomUUID } from "node:crypto";
import { expect, request, test, type APIRequestContext, type Page } from "@playwright/test";
import type { ChallengeCreateRequestDTO, ChallengeDetailDTO, LeaderboardResponseDTO } from "../../shared/src/index.js";
import { DEMO_CHALLENGE_IDS, DEMO_PASSWORD } from "../../backend/prisma/seed.js";

const avatarPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aR1sAAAAASUVORK5CYII=";
const freshUsername = (label: string): string => `e2e_${label}_${randomUUID().replaceAll("-", "").slice(0, 12)}`;

async function registerUser(api: APIRequestContext, username: string): Promise<void> {
  expect((await api.post("/api/auth/register", { data: { username, password: DEMO_PASSWORD } })).status()).toBe(200);
}

async function createUser(baseURL: string, label: string): Promise<{ api: APIRequestContext; username: string }> {
  const api = await request.newContext({ baseURL });
  const username = freshUsername(label);
  await registerUser(api, username);
  expect((await api.post("/api/auth/login", { data: { username, password: DEMO_PASSWORD } })).status()).toBe(200);
  return { api, username };
}

async function login(page: Page, username: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.locator("form.auth-form").getByRole("button", { name: "Accedi" }).click();
  await expect(page).toHaveURL(/\/challenges$/);
}

function challengeBody(title: string): ChallengeCreateRequestDTO {
  return {
    title,
    description: "Riconosci esclusivamente sequenze della lettera a.",
    difficulty: "EASY",
    secretPattern: "a+",
    publicPositiveExample: "a",
    publicNegativeExample: "b",
    controls: [
      { kind: "POSITIVE", value: "aaa" },
      { kind: "NEGATIVE", value: "bbb" }
    ]
  };
}

async function createChallenge(api: APIRequestContext, body: ChallengeCreateRequestDTO): Promise<ChallengeDetailDTO> {
  const response = await api.post("/api/challenges", { data: body });
  expect(response.status(), await response.text()).toBe(201);
  return response.json() as Promise<ChallengeDetailDTO>;
}

async function attempt(api: APIRequestContext, id: string, pattern: string) {
  return api.post(`/api/challenges/${id}/attempts`, { data: { pattern } });
}

function expectNoSecretKeys(value: unknown): void {
  if (value === null || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    expect(["secretPattern", "controls", "passwordHash", "sessionToken", "proposedPattern"]).not.toContain(key);
    expectNoSecretKeys(nested);
  }
}

function expectNoControlValues(value: unknown, controls: readonly string[]): void {
  if (typeof value === "string") {
    expect(controls).not.toContain(value);
  } else if (value !== null && typeof value === "object") {
    for (const nested of Object.values(value)) expectNoControlValues(nested, controls);
  }
}

test.describe("Regressioni della traccia", () => {
  test("11. Landing pubblica e API riservate richiedono autenticazione", async ({ page }) => {
    for (const route of ["/", "/how-it-works", "/login", "/register"]) {
      await page.goto(route);
      await expect(page.locator("#main-content h1")).toBeVisible();
      await expect(page.getByRole("button", { name: "Esci" })).toHaveCount(0);
    }
    await page.goto("/");
    await page.getByRole("link", { name: "Accedi e gioca" }).click();
    await expect(page).toHaveURL(/\/login$/);
    for (const endpoint of ["/api/auth/me", "/api/challenges", "/api/leaderboard"]) {
      expect((await page.request.get(endpoint)).status()).toBe(401);
    }
    expect((await page.request.post("/api/challenges", { data: challengeBody("Accesso anonimo") })).status()).toBe(401);
  });

  test("12. Alternativa breve e quantificatore lazy riconoscono l'intera stringa", async ({ baseURL }) => {
    const author = await createUser(baseURL!, "regexauthor");
    const solver = await createUser(baseURL!, "regexsolver");
    try {
      for (const pattern of ["a|ab", "a+?"]) {
        const body = challengeBody(`Corrispondenza completa ${pattern}`);
        body.secretPattern = pattern;
        body.publicPositiveExample = pattern === "a|ab" ? "ab" : "aa";
        body.controls = [
          { kind: "POSITIVE", value: pattern === "a|ab" ? "ab" : "aaa" },
          { kind: "NEGATIVE", value: "ba" },
          { kind: "NEGATIVE", value: "a\n" }
        ];
        const challenge = await createChallenge(author.api, body);
        const submitted = await attempt(solver.api, challenge.id, pattern);
        expect(submitted.status()).toBe(201);
        expect((await submitted.json()).attempt).toMatchObject({ positiveMatched: 1, negativeMatched: 0, isCorrect: true, attemptNumber: 1 });
      }
    } finally {
      await author.api.dispose();
      await solver.api.dispose();
    }
  });

  test("13. Creazione convalida regex, coerenza e limite dieci controlli per tipo", async ({ baseURL }) => {
    const author = await createUser(baseURL!, "validation");
    try {
      const valid = challengeBody("Confini dei controlli");
      valid.controls = Array.from({ length: 10 }, (_, i) => [
        { kind: "POSITIVE" as const, value: "a".repeat(i + 1) },
        { kind: "NEGATIVE" as const, value: "b".repeat(i + 1) }
      ]).flat();
      await createChallenge(author.api, valid);
      const invalidCases = [
        { body: { ...valid, secretPattern: "[" }, status: 422, code: "INVALID_REGEX" },
        { body: { ...valid, publicPositiveExample: "b" }, status: 422, code: "INCOHERENT_CHALLENGE" },
        { body: { ...valid, controls: [{ kind: "POSITIVE", value: "bbb" }, { kind: "NEGATIVE", value: "aaa" }] }, status: 422, code: "INCOHERENT_CHALLENGE" },
        { body: { ...valid, controls: [...valid.controls.filter((c) => c.kind === "POSITIVE"), { kind: "POSITIVE", value: "a".repeat(11) }, { kind: "NEGATIVE", value: "b" }] }, status: 400, code: "BAD_REQUEST" },
        { body: { ...valid, controls: [] }, status: 400, code: "BAD_REQUEST" },
        { body: { ...valid, controls: [{ kind: "POSITIVE", value: "a" }, { kind: "POSITIVE", value: "a" }, { kind: "NEGATIVE", value: "b" }] }, status: 400, code: "BAD_REQUEST" }
      ];
      for (const { body, status, code } of invalidCases) {
        const response = await author.api.post("/api/challenges", { data: body });
        expect(response.status(), JSON.stringify(body)).toBe(status);
        expect((await response.json()).code).toBe(code);
      }
    } finally {
      await author.api.dispose();
    }
  });

  test("14. Autore escluso, segreti nascosti e tentativi invalidi non conteggiati", async ({ baseURL }) => {
    const author = await createUser(baseURL!, "secret_author");
    const solver = await createUser(baseURL!, "secret_solver");
    try {
      const challenge = await createChallenge(author.api, challengeBody("Controlli riservati"));
      expectNoSecretKeys(challenge);
      for (const api of [author.api, solver.api]) {
        const detail = await api.get(`/api/challenges/${challenge.id}`);
        expect(detail.status()).toBe(200);
        const value = await detail.json();
        expectNoSecretKeys(value);
        expectNoControlValues(value, ["aaa", "bbb"]);
        expectNoSecretKeys(await (await api.get("/api/challenges")).json());
        expectNoSecretKeys(await (await api.get("/api/auth/me")).json());
      }
      const forbidden = await attempt(author.api, challenge.id, "a+");
      expect(forbidden.status()).toBe(403);
      expect((await forbidden.json()).code).toBe("AUTHOR_CANNOT_ATTEMPT");
      const invalid = await attempt(solver.api, challenge.id, "[");
      expect(invalid.status()).toBe(422);
      expect((await invalid.json()).code).toBe("INVALID_REGEX");
      const wrong = await attempt(solver.api, challenge.id, ".*");
      expect(wrong.status()).toBe(201);
      const wrongBody = await wrong.json();
      expectNoSecretKeys(wrongBody);
      expect(wrongBody.attempt).toMatchObject({ attemptNumber: 1, positiveMatched: 1, negativeMatched: 1, isCorrect: false });
      const correct = await attempt(solver.api, challenge.id, "a+");
      expect(correct.status()).toBe(201);
      expect((await correct.json()).attempt).toMatchObject({ attemptNumber: 2, negativeMatched: 0, isCorrect: true });
      expect((await attempt(solver.api, challenge.id, "a+")).status()).toBe(409);
      const me = await (await solver.api.get("/api/auth/me")).json();
      expect(me.user.stats).toMatchObject({ attemptsTotal: 2, solvedTotal: 1 });
      expect(me.user.solvedChallenges[0]).toMatchObject({ id: challenge.id, attemptsUsed: 2 });
    } finally {
      await author.api.dispose();
      await solver.api.dispose();
    }
  });

  test("15. Profilo e feedback si aggiornano dopo i tentativi senza ricaricare", async ({ page, baseURL }) => {
    const author = await createUser(baseURL!, "profile_author");
    const username = freshUsername("profile_solver");
    await registerUser(page.request, username);
    try {
      const challenge = await createChallenge(author.api, challengeBody("Statistiche aggiornate"));
      await login(page, username);
      await page.goto(`/challenges/${challenge.id}`);
      await page.evaluate(() => { (window as unknown as Record<string, unknown>).__e2eDocumentMarker = "same-document"; });
      await page.getByLabel("Regex candidata").fill(".*");
      await page.getByRole("button", { name: "Invia tentativo" }).click();
      const wrong = page.locator(".attempt-card").first();
      await expect(wrong.locator(".attempt-breakdown > div").filter({ hasText: "Controlli negativi" }).locator("strong")).toHaveText("1/1");
      await page.getByRole("link", { name: "Profilo", exact: true }).click();
      await expect(page.locator(".mini-stat").filter({ hasText: "Tentativi" }).locator("strong")).toHaveText("1");
      await expect(page.locator(".mini-stat").filter({ hasText: "Risolte" }).locator("strong")).toHaveText("0");
      await page.getByRole("link", { name: "Sfide", exact: true }).click();
      await page.getByRole("link", { name: new RegExp(challenge.title) }).click();
      await page.getByLabel("Regex candidata").fill("a+");
      await page.getByRole("button", { name: "Invia tentativo" }).click();
      await expect(page.getByText("Soluzione corretta")).toBeVisible();
      await expect(page.locator(".attempt-card").first().locator(".attempt-breakdown > div").filter({ hasText: "Controlli negativi" }).locator("strong")).toHaveText("0/1");
      await page.getByRole("link", { name: "Profilo", exact: true }).click();
      await expect(page.locator(".mini-stat").filter({ hasText: "Tentativi" }).locator("strong")).toHaveText("2");
      await expect(page.locator(".mini-stat").filter({ hasText: "Risolte" }).locator("strong")).toHaveText("1");
      await expect(page.locator(".profile-riddle-list").getByText(challenge.title, { exact: true })).toBeVisible();
      expect(await page.evaluate(() => (window as unknown as Record<string, unknown>).__e2eDocumentMarker)).toBe("same-document");
    } finally {
      await author.api.dispose();
    }
  });

  test("16. Classifica usa soluzioni nuove, numero risolte e media tentativi", async ({ baseURL }) => {
    const author = await createUser(baseURL!, "rank_author");
    const fast = await createUser(baseURL!, "rank_fast");
    const slow = await createUser(baseURL!, "rank_slow");
    const one = await createUser(baseURL!, "rank_one");
    try {
      const first = await createChallenge(author.api, challengeBody("Classifica prima sfida"));
      const second = await createChallenge(author.api, challengeBody("Classifica seconda sfida"));
      for (const challenge of [first, second]) {
        expect((await attempt(fast.api, challenge.id, "a+")).status()).toBe(201);
      }
      expect((await attempt(slow.api, first.id, ".*")).status()).toBe(201);
      for (const challenge of [first, second]) {
        expect((await attempt(slow.api, challenge.id, "a+")).status()).toBe(201);
      }
      expect((await attempt(one.api, first.id, "a+")).status()).toBe(201);
      const response = await fast.api.get("/api/leaderboard");
      expect(response.status()).toBe(200);
      const { items } = await response.json() as LeaderboardResponseDTO;
      expectNoSecretKeys(items);
      const fastRow = items.find((row) => row.user.username === fast.username)!;
      const slowRow = items.find((row) => row.user.username === slow.username)!;
      const oneRow = items.find((row) => row.user.username === one.username)!;
      expect(fastRow).toMatchObject({ solvedCount: 2, averageAttempts: 1 });
      expect(slowRow).toMatchObject({ solvedCount: 2, averageAttempts: 1.5 });
      expect(oneRow).toMatchObject({ solvedCount: 1, averageAttempts: 1 });
      expect(fastRow.rank).toBeLessThan(slowRow.rank);
      expect(slowRow.rank).toBeLessThan(oneRow.rank);
      for (let index = 0; index < items.length; index++) {
        expect(items[index]!.rank).toBe(index + 1);
        if (index === 0) continue;
        const previous = items[index - 1]!;
        const current = items[index]!;
        expect(previous.solvedCount).toBeGreaterThanOrEqual(current.solvedCount);
        if (previous.solvedCount === current.solvedCount) expect(previous.averageAttempts).toBeLessThanOrEqual(current.averageAttempts);
      }
    } finally {
      await Promise.all([author, fast, slow, one].map((user) => user.api.dispose()));
    }
  });

  test("17. Avatar caricato e username modificato persistono al nuovo accesso", async ({ page }) => {
    const username = freshUsername("avatar");
    const updatedUsername = freshUsername("updated");
    await registerUser(page.request, username);
    await login(page, username);
    await page.getByRole("link", { name: "Profilo", exact: true }).click();
    await page.getByLabel("File avatar").setInputFiles({ name: "avatar.png", mimeType: "image/png", buffer: Buffer.from(avatarPng, "base64") });
    await page.getByLabel("Username", { exact: true }).fill(updatedUsername);
    await page.getByRole("button", { name: "Salva", exact: true }).click();
    await expect(page.getByText("Profilo aggiornato.")).toBeVisible();
    await expect(page.getByRole("heading", { name: `@${updatedUsername}` })).toBeVisible();
    const avatar = page.locator(".profile-card img.avatar");
    await expect(avatar).toHaveAttribute("src", `data:image/png;base64,${avatarPng}`);
    await expect.poll(() => avatar.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBe(1);
    await page.getByRole("button", { name: "Esci" }).click();
    await login(page, updatedUsername);
    await page.getByRole("link", { name: "Profilo", exact: true }).click();
    await expect(avatar).toHaveAttribute("src", `data:image/png;base64,${avatarPng}`);
    const saved = await (await page.request.get("/api/auth/me")).json();
    expect(saved.user).toMatchObject({ username: updatedUsername, avatarUrl: `data:image/png;base64,${avatarPng}` });
    await page.getByRole("button", { name: "Rimuovi immagine avatar" }).click();
    await page.getByRole("button", { name: "Salva", exact: true }).click();
    await expect(page.getByText("Profilo aggiornato.")).toBeVisible();
    await page.reload();
    await expect(avatar).toHaveCount(0);
  });

  test("18. Più di cento sfide restano raggiungibili con pagine e filtri", async ({ page, baseURL }) => {
    test.setTimeout(90_000);
    const author = await createUser(baseURL!, "catalog");
    try {
      for (let index = 0; index < 101; index++) {
        const body = challengeBody(`Catalogo pagina ${String(index).padStart(3, "0")}`);
        await createChallenge(author.api, body);
      }
      const firstResponse = await author.api.get("/api/challenges?page=1&pageSize=100");
      expect(firstResponse.status()).toBe(200);
      const first = await firstResponse.json();
      expect(first.items).toHaveLength(100);
      expect(first.total).toBeGreaterThan(100);
      expect(first).toMatchObject({ page: 1, pageSize: 100 });
      const second = await (await author.api.get("/api/challenges?page=2&pageSize=100")).json();
      expect(second.items.length).toBeGreaterThan(0);
      const allIds = [...first.items, ...second.items].map((item: ChallengeDetailDTO) => item.id);
      expect(new Set(allIds).size).toBe(allIds.length);
      expect(allIds).toHaveLength(first.total);
      expect((await author.api.get("/api/challenges?pageSize=101")).status()).toBe(400);
      expect((await author.api.get("/api/challenges?page=0")).status()).toBe(400);
      await login(page, author.username);
      const pagination = page.getByRole("navigation", { name: "Pagine delle sfide" });
      await expect(pagination.getByText(/Pagina 1 di/)).toBeVisible();
      await pagination.getByRole("button", { name: "Successiva" }).click();
      await expect(pagination.getByText(/Pagina 2 di/)).toBeVisible();
      const defaultPage = await (await author.api.get("/api/challenges")).json();
      expect(defaultPage).toMatchObject({ page: 1, pageSize: 24 });
      for (let current = 2; current < defaultPage.totalPages; current++) {
        await pagination.getByRole("button", { name: "Successiva" }).click();
        await expect(pagination.getByText(`Pagina ${current + 1} di ${defaultPage.totalPages}`, { exact: true })).toBeVisible();
      }
      await expect(pagination.getByRole("button", { name: "Successiva" })).toBeDisabled();
      const last = await (await author.api.get(`/api/challenges?page=${defaultPage.totalPages}`)).json();
      for (const item of last.items as ChallengeDetailDTO[]) await expect(page.locator(`a[href="/challenges/${item.id}"]`)).toBeVisible();
      const filteredResponse = page.waitForResponse((response) => {
        const url = new URL(response.url());
        return url.pathname === "/api/challenges" && url.searchParams.get("difficulty") === "HARD" && url.searchParams.get("page") === "1";
      });
      await page.getByRole("button", { name: "difficile", exact: true }).click();
      expect((await filteredResponse).status()).toBe(200);
      const filtered = await (await author.api.get("/api/challenges?difficulty=HARD")).json();
      for (const item of filtered.items as ChallengeDetailDTO[]) expect(item.difficulty).toBe("HARD");
      await expect(page.getByRole("link", { name: /Catalogo pagina/ })).toHaveCount(0);
      await page.getByRole("button", { name: "Tutte", exact: true }).click();
      await expect(pagination.getByText(/Pagina 1 di/)).toBeVisible();
      await expect(page.getByRole("link", { name: /Catalogo pagina 100/ })).toBeVisible();
    } finally {
      await author.api.dispose();
    }
  });

  test("19. A 320 pixel i contenuti e i comandi navigazione restano dentro lo schermo", async ({ page, baseURL }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 600 });
    // Reserve a real 15px scrollbar gutter even on Chromium's overlay-scrollbar hosts.
    const checkLayout = async (): Promise<void> => {
      await page.addStyleTag({ content: "html { overflow-y: scroll; scrollbar-gutter: stable; } ::-webkit-scrollbar { width: 15px; }" });
      const metrics = await page.evaluate(() => ({ route: location.pathname, viewport: window.innerWidth, client: document.documentElement.clientWidth, rootWidth: document.documentElement.getBoundingClientRect().width, scroll: document.documentElement.scrollWidth, gutter: getComputedStyle(document.documentElement).scrollbarGutter, overflow: getComputedStyle(document.documentElement).overflowY, overflowingElements: Array.from(document.querySelectorAll("body *")).map((element) => ({ tag: element.tagName, className: element.getAttribute("class"), right: element.getBoundingClientRect().right, width: element.getBoundingClientRect().width })).filter((element) => element.right > document.documentElement.clientWidth + 1) }));
      await testInfo.attach(`layout-${metrics.route.replaceAll("/", "_")}`, { body: JSON.stringify(metrics), contentType: "application/json" });
      if (metrics.route === "/create" && metrics.scroll > metrics.client) await page.screenshot({ path: "../output/create-320-diagnostic.png", fullPage: true, animations: "disabled" });
      expect(metrics.client).toBe(305);
      expect(metrics.scroll).toBeLessThanOrEqual(metrics.client);
      const nav = page.getByRole("navigation", { name: "Navigazione principale" });
      const commands = nav.locator("a:visible, button:visible");
      for (const command of await commands.all()) {
        const box = await command.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(metrics.client + 1);
      }
    };
    for (const route of ["/", "/how-it-works", "/login", "/register"]) {
      await page.goto(route);
      await expect(page.locator("#main-content h1")).toBeVisible();
      await checkLayout();
      if (route === "/") await page.screenshot({ path: "../output/landing-320.png", fullPage: true, animations: "disabled" });
    }
    const username = `e2e_narrow_${randomUUID().replaceAll("-", "").slice(0, 21)}`;
    await registerUser(page.request, username);
    const author = await createUser(baseURL!, "narrow_author");
    try {
      const body = challengeBody("A".repeat(100));
      body.description = "x".repeat(1_000);
      body.publicPositiveExample = "a".repeat(200);
      body.publicNegativeExample = "b".repeat(200);
      const boundaryChallenge = await createChallenge(author.api, body);
      await login(page, username);
      for (const route of ["/challenges", "/account", "/create", "/leaderboard", `/challenges/${boundaryChallenge.id}`, `/challenges/${DEMO_CHALLENGE_IDS.pin}`]) {
        await page.goto(route);
        await expect(page.locator("#main-content h1")).toBeVisible();
        await checkLayout();
        if (route === "/create") await page.screenshot({ path: "../output/create-320.png", fullPage: true, animations: "disabled" });
        if (route.endsWith(DEMO_CHALLENGE_IDS.pin)) {
          await page.getByLabel("Regex candidata").fill(".*");
          await page.getByRole("button", { name: "Invia tentativo" }).click();
          await expect(page.locator(".attempt-card").first().locator(".attempt-breakdown > div").filter({ hasText: "Controlli negativi" }).locator("strong")).toHaveText("2/2");
          await checkLayout();
        }
      }
    } finally {
      await author.api.dispose();
    }
  });

  test("20. Un errore nel refresh del profilo conserva il tentativo e recupera aprendo il profilo", async ({ page, baseURL }) => {
    const author = await createUser(baseURL!, "refresh_author");
    const username = freshUsername("refresh_solver");
    await registerUser(page.request, username);
    try {
      const challenge = await createChallenge(author.api, challengeBody("Refresh dopo la soluzione"));
      await login(page, username);
      await page.goto(`/challenges/${challenge.id}`);
      await expect(page.getByLabel("Regex candidata")).toBeVisible();
      let interceptedRefreshes = 0;
      await page.route("**/api/auth/me", (route) => {
        interceptedRefreshes += 1;
        return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ code: "INTERNAL_SERVER_ERROR", error: "Service Unavailable", message: "Refresh unavailable" }) });
      }, { times: 1 });
      const failedRefresh = page.waitForResponse((response) => response.url().endsWith("/api/auth/me") && response.status() === 503);
      await page.getByLabel("Regex candidata").fill("a+");
      await page.getByRole("button", { name: "Invia tentativo" }).click();
      expect((await failedRefresh).status()).toBe(503);
      expect(interceptedRefreshes).toBe(1);
      await expect(page.getByText("Soluzione corretta")).toBeVisible();
      await expect(page.getByText("Tentativo registrato. Le statistiche non sono state aggiornate; verranno ricaricate aprendo il profilo.")).toBeVisible();
      await page.getByRole("link", { name: "Profilo", exact: true }).click();
      await expect(page.locator(".mini-stat").filter({ hasText: "Risolte" }).locator("strong")).toHaveText("1");
      await expect(page.locator(".profile-riddle-list").getByText(challenge.title, { exact: true })).toBeVisible();
    } finally {
      await author.api.dispose();
    }
  });
});
