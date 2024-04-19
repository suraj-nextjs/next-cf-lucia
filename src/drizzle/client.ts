import { LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

let dbInstance: LibSQLDatabase | undefined;

export const getDb = (DATABASE_URL: string, DATABASE_AUTH_TOKEN: string) => {
  if (dbInstance) {
    return dbInstance;
  }
  const client = createClient({
    url: DATABASE_URL,
    authToken: DATABASE_AUTH_TOKEN,
  });

  dbInstance = drizzle(client);
  return dbInstance;
};
