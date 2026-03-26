import { NextResponse } from "next/server";
import { NOTION_OAUTH_COOKIE, baseCookieOptions } from "@/lib/premium-cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true as const });
  res.cookies.set(NOTION_OAUTH_COOKIE, "", {
    ...baseCookieOptions(),
    maxAge: 0,
  });
  return res;
}
