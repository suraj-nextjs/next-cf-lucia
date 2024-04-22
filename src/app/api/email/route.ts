import { Resend } from "resend";
import { EmailTemplate } from "@/components/email/email-template";
import { NextRequest } from "next/server";
import { getResend } from "@/auth";
import { getRequestContext } from "@cloudflare/next-on-pages";

export async function POST(req: NextRequest) {
  const resend = getResend(getRequestContext().env.RESEND_API_KEY);

  const body = await req.json<{ email: string }>();

  try {
    const data = await resend.emails.send({
      from: "Auth <no-reply@suraj-patil.in>",
      to: [body.email],
      subject: "Hello world",
      text: "Hello world",
      react: EmailTemplate({ firstName: "John" }),
    });

    return Response.json(data);
  } catch (error) {
    return Response.json({ error });
  }
}
