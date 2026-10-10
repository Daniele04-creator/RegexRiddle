import "dotenv/config";

export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl === undefined || databaseUrl === "") {
    throw new Error("DATABASE_URL must be set.");
  }

  return databaseUrl;
}
