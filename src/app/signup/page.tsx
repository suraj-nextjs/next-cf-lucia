import Link from "next/link";
import { cookies } from "next/headers";
import { getLucia, validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Form } from "./form";
import { generateId } from "lucia";
import type { ActionResult } from "./form";
import { getDb } from "@/drizzle/client";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { userTable } from "@/drizzle/schema";

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/");
  }
  return (
    <>
      <h1>Create an account</h1>
      <Form action={signup}>
        <label htmlFor="username">Username</label>
        <input name="username" id="username" />
        <br />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <button>Continue</button>
      </Form>
      <Link href="/login">Sign in</Link>
    </>
  );
}

async function signup(_: any, formData: FormData): Promise<ActionResult> {
  "use server";
  const username = formData.get("username");
  // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
  // keep in mind some database (e.g. mysql) are case insensitive
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

  const hashedPassword = password;
  const userId = generateId(15);

  const db = getDb(
    getRequestContext().env.DATABASE_URL,
    getRequestContext().env.DATABASE_AUTH_TOKEN
  );

  const lucia = getLucia(
    getRequestContext().env.DATABASE_URL,
    getRequestContext().env.DATABASE_AUTH_TOKEN
  );

  try {
    await db.insert(userTable).values({
      id: userId,
      username: username,
      password: hashedPassword,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  } catch (e) {
    // if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
    //   return {
    //     error: "Username already used",
    //   };
    // }
    console.log(e);
    return {
      error: "An unknown error occurred",
    };
  }
  return redirect("/");
}
