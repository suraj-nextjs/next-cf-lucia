"use server";

import { getLucia, validateRequest } from "@/auth";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOGIN_PATH } from "@/routes";

export const logout = async () => {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  const lucia = getLucia(
    getRequestContext().env.DATABASE_URL,
    getRequestContext().env.DATABASE_AUTH_TOKEN
  );

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect(LOGIN_PATH);
};
