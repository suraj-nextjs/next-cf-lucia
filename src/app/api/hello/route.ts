import { NextResponse, type NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { db } from "@/drizzle/client";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  let responseText = "Hello World";

  const users = await db.query.users.findMany();

  // In the edge runtime you can use Bindings that are available in your application
  // (for more details see:
  //    - https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/#use-bindings-in-your-nextjs-application
  //    - https://developers.cloudflare.com/pages/functions/bindings/
  // )
  //
  // KV Example:
  // const myKv = getRequestContext().env.MY_KV_NAMESPACE
  // await myKv.put('suffix', ' from a KV store!')
  // const suffix = await myKv.get('suffix')
  // responseText += suffix

  // return new Response(
  //   users.length > 0 ? JSON.stringify(users) : responseText,
  //   {}
  // );

  return NextResponse.json({ users });
}
