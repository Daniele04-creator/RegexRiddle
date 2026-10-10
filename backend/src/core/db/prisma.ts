import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../generated/prisma/client.js";
import { getDatabaseUrl } from "./database-url.js";

const databaseUrl = new URL(getDatabaseUrl());
export const databaseSchema = databaseUrl.searchParams.get("schema")?.trim() || "public";
databaseUrl.searchParams.delete("schema");

const adapter = new PrismaPg(
  {
    connectionString: databaseUrl.toString()
  },
  { schema: databaseSchema }
);

export const prisma = new PrismaClient({ adapter });
