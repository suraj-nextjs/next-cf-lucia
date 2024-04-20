// src/auth.ts
import { Lucia, Session, User } from "lucia";
import { getDb } from "./drizzle/client";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { sessionTable, user, userTable } from "./drizzle/schema";
import { cache } from "react";
import { cookies } from "next/headers";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { GitHub } from "arctic";

let lucia: Lucia<Record<never, never>, Record<never, never>> | undefined;

export const getLucia = (DATABASE_URL: string, DATABASE_AUTH_TOKEN: string) => {
  if (lucia) {
    return lucia;
  }

  const db = getDb(DATABASE_URL, DATABASE_AUTH_TOKEN);
  const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

  lucia = new Lucia(adapter, {
    sessionCookie: {
      // this sets cookies with super long expiration
      // since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
      expires: false,
      attributes: {
        // set to `true` when using HTTPS
        secure: process.env.NODE_ENV === "production",
      },
    },
    getUserAttributes: (attributes) => {
      return {
        email: attributes.email,
        githubId: attributes.githubId,
      };
    },
  });

  return lucia;
};

let github: GitHub | undefined;

export const getGitHub = (
  GITHUB_CLIENT_ID: string,
  GITHUB_CLIENT_SECRET: string
) => {
  if (github) {
    return github;
  }
  github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET);
  return github;
};

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const lucia = getLucia(
      getRequestContext().env.DATABASE_URL,
      getRequestContext().env.DATABASE_AUTH_TOKEN
    );

    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);
    // next.js throws when you attempt to set cookie when rendering page
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch {}
    return result;
  }
);

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<typeof user, "id">;
  }

  interface User extends Omit<typeof user, "id"> {}
}
