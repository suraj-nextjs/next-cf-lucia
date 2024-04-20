import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
export const userTable = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"),
  githubId: integer("github_id").unique().default(0),
});

export const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at").notNull(),
});

export const user = userTable.$inferSelect;
