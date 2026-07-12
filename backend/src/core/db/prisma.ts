import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../generated/prisma/client.js";
import { getDatabaseUrl } from "./database-url.js";

const databaseUrl = new URL(getDatabaseUrl());
const schema = databaseUrl.searchParams.get("schema")?.trim();
databaseUrl.searchParams.delete("schema");

const adapter = new PrismaPg(
  {
    connectionString: databaseUrl.toString()
  },
  schema ? { schema } : undefined
);

export const prisma = new PrismaClient({ adapter });
