import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { NOTION_OAUTH_COOKIE } from "@/lib/premium-cookies";
import { updateNotionPointsWithToken } from "@/lib/notion/session-queries";

type Body = {
  pageId?: string;
  pointsProperty?: string;
  value?: number;
};

export async function POST(request: NextRequest) {
  const jar = await cookies();
  const token = jar.get(NOTION_OAUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ ok: false, message: "Notion OAuth 未ログインです。" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, message: "JSON が不正です。" }, { status: 400 });
  }

  const pageId = body.pageId?.trim();
  const pointsProperty = body.pointsProperty?.trim();
  const value = body.value;
  if (!pageId || !pointsProperty || typeof value !== "number") {
    return NextResponse.json({ ok: false, message: "pageId・pointsProperty・value が必要です。" }, { status: 400 });
  }

  try {
    await updateNotionPointsWithToken(token, pageId, pointsProperty, value);
    return NextResponse.json({ ok: true as const });
  } catch (e) {
    const message = e instanceof Error ? e.message : "更新に失敗しました。";
    return NextResponse.json({ ok: false as const, message }, { status: 502 });
  }
}
