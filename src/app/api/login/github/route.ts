import { getGitHub } from "@/auth";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { generateState } from "arctic";

import { cookies } from "next/headers";

export async function GET(): Promise<Response> {
  const state = generateState();

  const github = getGitHub(
    getRequestContext().env.GITHUB_CLIENT_ID,
    getRequestContext().env.GITHUB_CLIENT_SECRET
  );

  const url = await github.createAuthorizationURL(state);

  console.log(JSON.stringify(url));

  cookies().set("github_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return Response.json(url);
}
