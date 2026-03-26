import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Database, Shield, Sparkles, ArrowRight } from "lucide-react";
import { PremiumNotionBackLink } from "@/components/PremiumNotionBackLink";

export const metadata: Metadata = {
  title: "プレミアム Notion 連携（近日公開）",
  description:
    "Design Story Point のプレミアム向け Notion API 連携。OAuth による安全な接続とタスク同期・ポイント反映の予定機能を説明します。",
  robots: { index: true, follow: true },
  openGraph: {
    title: "プレミアム Notion 連携 | Design Story Point",
    description: "近日リリース予定の Notion 連携機能の概要です。",
  },
};

export default function PremiumNotionComingSoonPage() {
  return (
    <main className="min-h-screen bg-[var(--lp-bg)] px-6 py-12 text-[var(--foreground)]">
      <div className="mx-auto max-w-2xl">
        <p className="text-caption font-medium text-[var(--muted-foreground)]">Design Story Point · プレミアム</p>
        <h1 className="heading-lg mt-2">Notion API 連携</h1>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-950">
          <Sparkles className="h-4 w-4" aria-hidden />
          近日リリース予定
        </p>
        <p className="text-body mt-6 leading-relaxed text-[var(--muted-foreground)]">
          チームの Notion データベースとルームをつなぎ、見積もりの手間を減らす機能を開発しています。公開時は
          <strong className="text-[var(--foreground)]"> プレミアム会員向け</strong>
          に提供し、月額 <strong className="text-[var(--foreground)]">¥600</strong>
          （税込想定・リリース時に確定）のカード決済（Stripe）でお申し込みいただいた方がご利用いただける予定です。
        </p>

        <section className="mt-10 space-y-4 rounded-3xl border border-[var(--lp-border)] bg-white p-6 sm:p-8">
          <h2 className="heading-md">できるようになること（予定）</h2>
          <ul className="space-y-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
            <li className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--lp-muted-card)] text-[var(--foreground)]">
                <Shield className="h-4 w-4" aria-hidden />
              </span>
              <span>
                <strong className="text-[var(--foreground)]">安全な認証（OAuth）</strong>
                <br />
                インテグレーションのシークレットをコピー＆ペーストしてブラウザに保存する方式は廃止し、Notion
                公式の許可画面だけで接続します。トークンは httpOnly Cookie に載せ、XSS や共有端末でのリスクを抑えます。
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--lp-muted-card)] text-[var(--foreground)]">
                <Database className="h-4 w-4" aria-hidden />
              </span>
              <span>
                <strong className="text-[var(--foreground)]">タスクの取り込み</strong>
                <br />
                指定したデータベースから行一覧を読み取り、タスク名や Issue / Figma の URL をルームのタスク欄に自動入力。未設定ポイントの行を優先して選べる動きを想定しています。
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--lp-muted-card)] text-[var(--foreground)]">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <span>
                <strong className="text-[var(--foreground)]">合意ポイントの書き戻し</strong>
                <br />
                投票で決まったストーリーポイントを、Notion 上の数値プロパティに自動で反映。セッション後の転記作業を省きます。
              </span>
            </li>
          </ul>
        </section>

        <section className="mt-8 rounded-3xl border border-dashed border-[var(--lp-border)] bg-white/60 p-6 text-sm text-[var(--muted-foreground)]">
          <h2 className="heading-sm text-[var(--foreground)]">開発者向けメモ</h2>
          <p className="mt-2 leading-relaxed">
            先行検証時は環境変数 <code className="rounded bg-[var(--muted)] px-1 text-xs">NEXT_PUBLIC_PREMIUM_NOTION_LIVE=true</code>{" "}
            と Notion OAuth の各種キーを設定すると、ルーム内モーダルから接続を試せます。
          </p>
        </section>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/pricing" className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm">
            料金・プレミアムへ
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Suspense
            fallback={
              <span className="btn-secondary inline-flex justify-center rounded-full px-6 py-3 text-sm opacity-60">
                ルームに戻る
              </span>
            }
          >
            <PremiumNotionBackLink />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
