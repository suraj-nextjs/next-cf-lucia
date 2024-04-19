import Link from "next/link";
import { cookies } from "next/headers";
import { getLucia, validateRequest } from "../../auth";
import { redirect } from "next/navigation";
import { Form } from "../signup/form";

import type { ActionResult } from "../signup/form";
import { getDb } from "@/drizzle/client";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { userTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/");
  }
  return (
    <>
      <h1>Sign in</h1>
      <Form action={login}>
        <label htmlFor="username">Username</label>
        <input name="username" id="username" />
        <br />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <Button>Continue</Button>
      </Form>
      <Link href="/signup">Create an account</Link>
    </>
  );
}

async function login(_: any, formData: FormData): Promise<ActionResult> {
  "use server";
  const username = formData.get("username");
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return {
      error: "Invalid username",
    };
  }
  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }

  const db = getDb(
    getRequestContext().env.DATABASE_URL,
    getRequestContext().env.DATABASE_AUTH_TOKEN
  );

  const lucia = getLucia(
    getRequestContext().env.DATABASE_URL,
    getRequestContext().env.DATABASE_AUTH_TOKEN
  );

  console.log(username, password);

  const existingUser = (
    await db.select().from(userTable).where(eq(userTable.username, username))
  )?.[0];

  console.log(existingUser);

  if (!existingUser) {
    return {
      error: "Incorrect username or password",
    };
  }

  const validPassword = password === existingUser.password;

  //   await new Argon2id().verify(
  //     existingUser.password,
  //     password
  //   );
  if (!validPassword) {
    return {
      error: "Incorrect username or password",
    };
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect("/");
}
