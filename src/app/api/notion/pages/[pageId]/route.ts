import { NextResponse, type NextRequest } from "next/server";
import { updatePageProperties } from "@/lib/notion/server";

type Body = {
  number?: number | null;
  date?: string | null;
};

/**
 * PATCH: 指定 Page ID のプロパティを更新（数値・日付は環境変数のプロパティ名に紐づく）
 */
export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await ctx.params;
  if (!pageId) {
    return NextResponse.json({ ok: false, message: "pageId が必要です。" }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, message: "JSON ボディが不正です。" }, { status: 400 });
  }

  try {
    await updatePageProperties(pageId, {
      number: body.number,
      date: body.date,
    });
    return NextResponse.json({ ok: true as const });
  } catch (e) {
    const message = e instanceof Error ? e.message : "更新に失敗しました。";
    return NextResponse.json({ ok: false as const, message }, { status: 500 });
  }
}
