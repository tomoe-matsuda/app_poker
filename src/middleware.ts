import { NextResponse, type NextRequest } from "next/server";

function unauthorized(): NextResponse {
  return new NextResponse("認証が必要です。", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Notion"' },
  });
}

/**
 * 任意: NOTION_PAGE_BASIC_AUTH_USER / NOTION_PAGE_BASIC_AUTH_PASSWORD を設定すると
 * /notion と /api/notion/* を Basic 認証で保護します。
 * /api/notion/oauth/* は OAuth コールバック・ルームからの fetch 用のため対象外です。
 */
export function middleware(request: NextRequest) {
  const p = request.nextUrl.pathname;
  if (p.startsWith("/api/notion/oauth")) {
    return NextResponse.next();
  }

  const user = process.env.NOTION_PAGE_BASIC_AUTH_USER;
  const pass = process.env.NOTION_PAGE_BASIC_AUTH_PASSWORD;
  if (!user || !pass) {
    return NextResponse.next();
  }

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) {
    return unauthorized();
  }

  try {
    const decoded = atob(auth.slice(6));
    const sep = decoded.indexOf(":");
    const u = sep >= 0 ? decoded.slice(0, sep) : "";
    const p = sep >= 0 ? decoded.slice(sep + 1) : "";
    if (u === user && p === pass) {
      return NextResponse.next();
    }
  } catch {
    return unauthorized();
  }

  return unauthorized();
}

export const config = {
  matcher: ["/notion", "/notion/:path*", "/api/notion/:path*"],
};
