import { LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

let dbInstance: LibSQLDatabase<typeof schema> | undefined;

export const getDb = (DATABASE_URL: string, DATABASE_AUTH_TOKEN: string) => {
  if (dbInstance) {
    return dbInstance;
  }
  const client = createClient({
    url: DATABASE_URL,
    authToken: DATABASE_AUTH_TOKEN,
  });

  dbInstance = drizzle(client, { schema });
  return dbInstance;
};
