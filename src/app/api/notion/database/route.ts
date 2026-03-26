import { NextResponse } from "next/server";
import { queryDatabaseRowsForApp } from "@/lib/notion/server";

/**
 * GET: 接続済みデータベースの全行を JSON で返す（サーバーのみ NOTION_API_KEY を使用）
 */
export async function GET() {
  try {
    const rows = await queryDatabaseRowsForApp();
    return NextResponse.json({ ok: true as const, rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : "取得に失敗しました。";
    return NextResponse.json({ ok: false as const, message }, { status: 500 });
  }
}
