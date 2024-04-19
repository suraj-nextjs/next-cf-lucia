"use server";

import { getLucia } from "@/auth";
import { getDb } from "@/drizzle/client";
import { userTable } from "@/drizzle/schema";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginSchema } from "@/schemas";
import * as z from "zod";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  console.log(validatedFields);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email: username, password } = validatedFields.data;

  const db = getDb(
    getRequestContext().env.DATABASE_URL,
    getRequestContext().env.DATABASE_AUTH_TOKEN
  );

  const lucia = getLucia(
    getRequestContext().env.DATABASE_URL,
    getRequestContext().env.DATABASE_AUTH_TOKEN
  );

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

  if (!validPassword) {
    return {
      error: "Incorrect username or password",
    };
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  // cookies().set(
  //   sessionCookie.name,
  //   sessionCookie.value,
  //   sessionCookie.attributes
  // );
  return redirect("/");
};
