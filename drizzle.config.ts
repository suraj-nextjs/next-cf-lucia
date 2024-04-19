import { type Config } from "drizzle-kit";

export default {
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema.ts",
  breakpoints: true,
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
    authToken: process.env.DATABASE_AUTH_TOKEN as string,
  },
} satisfies Config;
