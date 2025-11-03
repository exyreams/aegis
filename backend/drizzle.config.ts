import type { Config } from "drizzle-kit";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Support both PostgreSQL and SQLite based on DATABASE_URL
const isPostgres =
  databaseUrl.startsWith("postgresql://") ||
  databaseUrl.startsWith("postgres://");
const isSQLite =
  databaseUrl.startsWith("sqlite:") || databaseUrl.endsWith(".db");

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: isPostgres ? "postgresql" : isSQLite ? "sqlite" : "postgresql",
  dbCredentials: isPostgres
    ? { url: databaseUrl }
    : { url: databaseUrl.replace("sqlite:", "") },
  verbose: true,
  strict: true,
} satisfies Config;
