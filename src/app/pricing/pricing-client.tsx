"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Check, Shield, Sparkles } from "lucide-react";
import { RoomReturnLink } from "@/components/RoomReturnLink";

export function PricingClient({ stripeReady }: { stripeReady: boolean }) {
  return (
    <main className="min-h-screen bg-[var(--lp-bg)] px-6 py-12 text-[var(--foreground)]">
      <div className="mx-auto max-w-5xl">
        <p className="text-caption font-medium text-[var(--muted-foreground)]">Design Story Point</p>
        <h1 className="heading-lg mt-1">プラン・料金</h1>
        <p className="text-body mt-3 max-w-2xl text-[var(--muted-foreground)]">
          無料でプランニングポーカーはそのまま利用できます。Notion を<strong>ブラウザにシークレットを置かず</strong>に連携したいチーム向けにプレミアムを用意しています。
        </p>

        {!stripeReady ? (
          <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            この環境では Stripe が未設定です。本番では <code className="text-xs">STRIPE_SECRET_KEY</code> と{" "}
            <code className="text-xs">STRIPE_PRICE_ID</code> を設定してください。
          </p>
        ) : null}

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="card-shadow flex flex-col rounded-3xl border border-[var(--lp-border)] bg-white p-6 sm:p-8">
            <h2 className="heading-md">無料</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight">¥0</p>
            <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-[var(--muted-foreground)]">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                ルーム作成・投票・履歴・CSV
              </li>
            </ul>
            <Link href="/start" className="btn-secondary mt-8 inline-flex justify-center rounded-full py-3 text-sm">
              無料で始める
            </Link>
          </article>

          <article className="card-shadow relative flex flex-col overflow-hidden rounded-3xl border-2 border-[var(--foreground)] bg-[var(--lp-muted-card)] p-6 sm:p-8">
            <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[var(--foreground)] px-2.5 py-1 text-xs font-semibold text-white">
              <Sparkles size={12} aria-hidden />
              プレミアム
            </span>
            <h2 className="heading-md flex items-center gap-2 pr-24">
              <Shield className="h-6 w-6" aria-hidden />
              安全な Notion
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">カード決済（Stripe）・月額サブスクリプション</p>
            <p className="mt-3 text-3xl font-bold tracking-tight">
              ¥600<span className="text-lg font-semibold text-[var(--muted-foreground)]">/月</span>
            </p>
            <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-[var(--muted-foreground)]">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                <span>
                  <strong className="text-[var(--foreground)]">Notion OAuth</strong>
                  … シークレットをコピペせず、httpOnly Cookie にトークン
                </span>
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                ルームからタスク取得・決定ポイントの Notion 反映
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                組織向けトークン運用は{" "}
                <Link href="/contact" className="link-muted underline underline-offset-2">
                  お問い合わせ
                </Link>
              </li>
            </ul>
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">リリース前のため、現在はお申し込みいただけません。</p>
            <button
              type="button"
              disabled
              title="リリース前のため、まだお申し込みいただけません"
              className="btn-primary mt-4 inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full py-3 text-sm opacity-50"
            >
              カードで申し込む
            </button>
          </article>
        </div>

        <p className="text-caption mx-auto mt-12 max-w-2xl leading-relaxed">
          決済は Stripe が処理します。カード番号は当サービスのサーバーに保存されません。解約・請求の詳細は Stripe の顧客ポータル（導入後にリンク整備）を想定しています。
        </p>

        <p className="mt-6 text-center">
          <Link href="/premium/notion" className="text-sm font-medium text-[var(--foreground)] underline underline-offset-2">
            プレミアム Notion 連携の詳細（近日公開）
          </Link>
        </p>

        <div className="mt-6 text-center">
          <Suspense
            fallback={
              <span className="link-muted text-sm underline underline-offset-2">ルームに戻る</span>
            }
          >
            <RoomReturnLink
              className="link-muted text-sm underline underline-offset-2 hover:text-[var(--foreground)]"
              asTextButton
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
