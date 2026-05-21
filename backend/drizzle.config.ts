import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: process.env.DATABASE_URL ? "postgresql" : "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || process.env.DB_PATH || "cartivore.db",
  },
});