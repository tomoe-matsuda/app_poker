import { NextRequest, NextResponse } from "next/server";

/**
 * Notion OAuth 開始。任意 query: state（認証後に戻るパス。先頭 / 必須）
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.NOTION_OAUTH_CLIENT_ID?.trim();
  const redirectUri = process.env.NOTION_OAUTH_REDIRECT_URI?.trim();
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { message: "Notion OAuth が未設定です（NOTION_OAUTH_CLIENT_ID / NOTION_OAUTH_REDIRECT_URI）。" },
      { status: 503 }
    );
  }

  const state = request.nextUrl.searchParams.get("state") || "/";
  const redirectEncoded = encodeURIComponent(redirectUri);
  const stateEncoded = encodeURIComponent(state);

  const url = `https://api.notion.com/v1/oauth/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&owner=user&redirect_uri=${redirectEncoded}&state=${stateEncoded}`;

  return NextResponse.redirect(url);
}
