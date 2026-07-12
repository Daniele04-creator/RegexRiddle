import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

const e2eDirectory = dirname(fileURLToPath(import.meta.url));
const rootEnvPath = join(e2eDirectory, "..", ".env");

export function loadRootEnvIfNeeded(): void {
  if (process.env.DATABASE_URL?.trim()) {
    return;
  }

  if (existsSync(rootEnvPath)) {
    loadEnvFile(rootEnvPath);
  }
}

export function getE2EDatabaseUrl(): string {
  loadRootEnvIfNeeded();

  const configuredUrl = process.env.DATABASE_URL?.trim();

  if (!configuredUrl) {
    throw new Error("DATABASE_URL must be set for E2E tests.");
  }

  const databaseUrl = new URL(configuredUrl);
  databaseUrl.searchParams.set("schema", "e2e");

  return databaseUrl.toString();
}
