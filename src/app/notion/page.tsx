import type { Metadata } from "next";
import Link from "next/link";
import { queryDatabaseRowsForApp } from "@/lib/notion/server";
import { NotionRowsEditor } from "./notion-rows-editor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notion 連携",
  description: "Notion データベースの一覧表示とプロパティ更新（サーバー側 API 経由）",
  robots: { index: false, follow: false },
};

export default async function NotionPage() {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    return (
      <main className="min-h-screen bg-[var(--lp-bg)] px-6 py-16 text-[var(--foreground)]">
        <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-[var(--lp-border)] bg-white p-8 shadow-sm">
          <h1 className="heading-lg">Notion 連携の設定</h1>
          <p className="text-body text-[var(--muted-foreground)]">
            Notion のインテグレーションを作成し、対象データベースに接続したうえで、次の環境変数を Vercel（または .env.local）に設定してください。
          </p>
          <ul className="list-inside list-disc text-sm text-[var(--muted-foreground)]">
            <li>
              <code className="text-xs">NOTION_API_KEY</code> — インテグレーションのシークレット
            </li>
            <li>
              <code className="text-xs">NOTION_DATABASE_ID</code> — データベースの ID
            </li>
            <li>
              <code className="text-xs">NOTION_TITLE_PROPERTY</code>（任意）— タイトル列名。既定は Name
            </li>
            <li>
              <code className="text-xs">NOTION_EDITABLE_NUMBER_PROP</code>（任意）— 更新する数値プロパティ名
            </li>
            <li>
              <code className="text-xs">NOTION_EDITABLE_DATE_PROP</code>（任意）— 更新する日付プロパティ名
            </li>
          </ul>
          <p className="text-caption">
            リポジトリの <code className="text-xs">.env.example</code> も参照してください。
          </p>
          <Link href="/" className="btn-primary inline-flex rounded-full px-5 py-2.5 text-sm">
            トップへ戻る
          </Link>
        </div>
      </main>
    );
  }

  let rows;
  try {
    rows = await queryDatabaseRowsForApp();
  } catch {
    return (
      <main className="min-h-screen bg-[var(--lp-bg)] px-6 py-16">
        <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-red-200 bg-red-50 p-8 text-red-900">
          <h1 className="text-xl font-bold">Notion の取得に失敗しました</h1>
          <p className="text-sm">
            データベース ID・インテグレーションのコネクト・プロパティ名を確認してください。
          </p>
          <Link href="/" className="btn-secondary inline-flex rounded-full px-5 py-2.5 text-sm">
            トップへ
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--lp-bg)] text-[var(--foreground)]">
      <NotionRowsEditor initialRows={rows} />
    </main>
  );
}
