import "dotenv/config";

import { defineConfig } from "prisma/config";

const SCHEMA_ONLY_DATABASE_URL =
  "postgresql://localhost:5432/regexriddle_prisma_generate";
const databaseUrl = process.env.DATABASE_URL?.trim();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url:
      databaseUrl === undefined || databaseUrl === ""
        ? SCHEMA_ONLY_DATABASE_URL
        : databaseUrl
  }
});
