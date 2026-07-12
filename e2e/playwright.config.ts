import { defineConfig, devices } from "@playwright/test";

import { getE2EDatabaseUrl, loadRootEnvIfNeeded } from "./env.js";

loadRootEnvIfNeeded();

const webPort = Number(process.env.WEB_PORT ?? 5173);
const apiPort = Number(process.env.API_PORT ?? 4000);
const webBaseURL = `http://127.0.0.1:${webPort}`;
const apiBaseURL = `http://127.0.0.1:${apiPort}`;
const e2eDatabaseUrl = getE2EDatabaseUrl();

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL: webBaseURL
  },
  webServer: [
    {
      command:
        "pnpm --dir ../backend exec prisma migrate reset --force && " +
        "pnpm --dir ../backend db:seed && " +
        "pnpm --dir ../backend dev",
      env: {
        DATABASE_URL: e2eDatabaseUrl
      },
      url: `${apiBaseURL}/health`,
      timeout: 120_000
    },
    {
      command: "pnpm --dir ../frontend build && node ../frontend/server.mjs",
      env: {
        API_ORIGIN: apiBaseURL,
        WEB_HOST: "127.0.0.1",
        WEB_PORT: String(webPort)
      },
      url: webBaseURL,
      timeout: 120_000
    }
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  reporter: [["list"]]
});
