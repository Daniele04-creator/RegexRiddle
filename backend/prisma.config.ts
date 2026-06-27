import "dotenv/config";

import { defineConfig } from "prisma/config";

const DEFAULT_DATABASE_URL =
  "postgresql://regexriddle:regexriddle_dev_password_change_me@127.0.0.1:55432/regexriddle_dev";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL
  }
});
