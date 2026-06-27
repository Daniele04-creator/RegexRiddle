import { defineConfig, devices } from "@playwright/test";

const webPort = Number(process.env.WEB_PORT ?? 5173);
const apiPort = Number(process.env.API_PORT ?? 4000);
const webBaseURL = `http://127.0.0.1:${webPort}`;
const apiBaseURL = `http://127.0.0.1:${apiPort}`;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL: webBaseURL,
    trace: "on-first-retry"
  },
  webServer: [
    {
      command: "pnpm --dir ../backend dev",
      url: `${apiBaseURL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000
    },
    {
      command: "pnpm --dir ../frontend dev",
      url: webBaseURL,
      reuseExistingServer: !process.env.CI,
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
