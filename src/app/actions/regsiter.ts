"use server";

import * as z from "zod";
import { RegisterSchema } from "@/schemas";
import { eq } from "drizzle-orm";
import { pbkdf2 } from "@/webcrypto-hash";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getDb } from "@/drizzle/client";
import { userTable } from "@/drizzle/schema";
import { generateId } from "lucia";
import { getLucia } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await pbkdf2(password);

  const db = getDb(
    getRequestContext().env.DATABASE_URL,
    getRequestContext().env.DATABASE_AUTH_TOKEN
  );

  const lucia = getLucia(
    getRequestContext().env.DATABASE_URL,
    getRequestContext().env.DATABASE_AUTH_TOKEN
  );

  const existingUser = (
    await db.select().from(userTable).where(eq(userTable.username, email))
  )?.[0];

  const userId = generateId(15);

  if (existingUser) {
    return { error: "Email already in use!" };
  }
  try {
    await db.insert(userTable).values({
      id: userId,
      username: email,
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

  return redirect("/auth/profile");
};
