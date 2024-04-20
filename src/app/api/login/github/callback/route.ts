import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";
import { getGitHub, getLucia } from "@/auth";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getDb } from "@/drizzle/client";
import { userTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("github_oauth_state")?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const github = getGitHub(
      getRequestContext().env.GITHUB_CLIENT_ID,
      getRequestContext().env.GITHUB_CLIENT_SECRET
    );
    const tokens = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const githubUser: GitHubUser = await githubUserResponse.json();

    const db = getDb(
      getRequestContext().env.DATABASE_URL,
      getRequestContext().env.DATABASE_AUTH_TOKEN
    );
    // Replace this with your own DB client.
    const existingUser = (
      await db
        .select()
        .from(userTable)
        .where(eq(userTable.githubId, +githubUser.id))
    )?.[0];

    const lucia = getLucia(
      getRequestContext().env.DATABASE_URL,
      getRequestContext().env.DATABASE_AUTH_TOKEN
    );

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    const userId = generateId(15);

    // Replace this with your own DB client.

    await db.insert(userTable).values({
      id: userId,
      githubId: +githubUser.id,
      email: githubUser.email,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/auth/profile",
      },
    });
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
}

interface GitHubUser {
  id: string;
  login: string;
  email: string;
}
