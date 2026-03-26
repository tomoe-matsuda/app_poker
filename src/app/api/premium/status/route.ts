import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { NOTION_OAUTH_COOKIE, PREMIUM_COOKIE } from "@/lib/premium-cookies";

export async function GET() {
  const jar = await cookies();
  const premium = jar.get(PREMIUM_COOKIE)?.value === "1";
  const notionOAuth = Boolean(jar.get(NOTION_OAUTH_COOKIE)?.value);
  return NextResponse.json({ premium, notionOAuth });
}
