import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { NOTION_OAUTH_COOKIE } from "@/lib/premium-cookies";
import { listNotionTasksWithToken, type NotionSessionListConfig } from "@/lib/notion/session-queries";

type Body = {
  databaseId?: string;
  titleProperty?: string;
  urlProperty?: string;
  pointsProperty?: string;
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

  const databaseId = body.databaseId?.trim();
  const pointsProperty = body.pointsProperty?.trim();
  if (!databaseId || !pointsProperty) {
    return NextResponse.json({ ok: false, message: "databaseId と pointsProperty は必須です。" }, { status: 400 });
  }

  const cfg: NotionSessionListConfig = {
    titleProperty: body.titleProperty?.trim() || undefined,
    urlProperty: body.urlProperty?.trim() || undefined,
    pointsProperty,
  };

  try {
    const rows = await listNotionTasksWithToken(token, databaseId, cfg);
    return NextResponse.json({ ok: true as const, rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : "取得に失敗しました。";
    return NextResponse.json({ ok: false as const, message }, { status: 502 });
  }
}
