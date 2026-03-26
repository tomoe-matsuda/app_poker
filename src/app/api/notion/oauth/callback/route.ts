import { NextRequest, NextResponse } from "next/server";
import { NOTION_OAUTH_COOKIE, baseCookieOptions } from "@/lib/premium-cookies";
import { getSiteUrl } from "@/lib/site";

export async function GET(request: NextRequest) {
  const site = getSiteUrl();
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const stateRaw = request.nextUrl.searchParams.get("state") || "/";

  if (error || !code) {
    return NextResponse.redirect(`${site}/pricing?notion_oauth=error`);
  }

  const clientId = process.env.NOTION_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.NOTION_OAUTH_CLIENT_SECRET?.trim();
  const redirectUri = process.env.NOTION_OAUTH_REDIRECT_URI?.trim();
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(`${site}/pricing?notion_oauth=error`);
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tok = (await tokenRes.json()) as { access_token?: string };
  if (!tokenRes.ok || !tok.access_token) {
    return NextResponse.redirect(`${site}/pricing?notion_oauth=error`);
  }

  let path = "/";
  try {
    path = decodeURIComponent(stateRaw);
  } catch {
    path = "/";
  }
  if (!path.startsWith("/")) path = `/${path}`;

  const joiner = path.includes("?") ? "&" : "?";
  const destination = `${site}${path}${joiner}notion_oauth_ok=1`;

  const res = NextResponse.redirect(destination);
  res.cookies.set(NOTION_OAUTH_COOKIE, tok.access_token, {
    ...baseCookieOptions(),
    maxAge: 60 * 60 * 24 * 90,
  });
  return res;
}
