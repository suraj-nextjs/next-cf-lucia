import { getLucia, validateRequest } from "../auth";
import { Form } from "./signup/form";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import type { ActionResult } from "./signup/form";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { LOGIN_PATH } from "@/routes";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect(LOGIN_PATH);
  }
  return (
    <>
      <h1>Hi, {user?.id}!</h1>
      <p>Your user ID is {user.id}.</p>
      <Form action={logout}>
        <button>Sign out</button>
      </Form>
    </>
  );
}

async function logout(): Promise<ActionResult> {
  "use server";
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
}
