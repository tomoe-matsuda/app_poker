"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ClipboardList, Plug, Share2, UserPlus } from "lucide-react";

const features = [
  {
    title: "タスクごとのポイント設定",
    body: "チームで相対評価し、判断基準をそろえます。",
    Icon: ClipboardList,
  },
  {
    title: "リンク共有で議論を活性化",
    body: "FigmaやIssueをタスクに紐づけて話しやすく。",
    Icon: Share2,
  },
  {
    title: "結果をデータ化して連携",
    body: "決定内容を整理し、外部ツール連携へつなげます。",
    Icon: Plug,
  },
] as const;

const howToSteps = [
  {
    step: "STEP 1",
    title: "ルームを発行して共有",
    description: "ホストがルームを発行し、参加リンクをチームへ共有します。",
    imageSrc: "/lp/step-1-invite.png",
    imageAlt: "招待リンクをチームへ送るイラスト",
  },
  {
    step: "STEP 2",
    title: "タスクを設定して見積もる",
    description: "タスクごとにポイントを提示し、差分を話して認識をそろえます。",
    imageSrc: "/lp/step-2-vote.png",
    imageAlt: "チームでカードをめくり見積もるイラスト",
  },
  {
    step: "STEP 3",
    title: "決定内容を外部連携",
    description: "合意したポイントを記録し、必要なツールへ連携します。",
    imageSrc: "/lp/step-3-next.png",
    imageAlt: "合意した結果を次のアクションへつなぐイラスト",
  },
] as const;

export function LpHomeClient() {
  return (
    <main className="min-h-screen bg-[var(--lp-bg)] pt-[4.5rem] text-[var(--foreground)] md:pt-[5.25rem]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--lp-border)] bg-[var(--lp-bg)]/95 backdrop-blur-sm">
        <div className="lp-shell lp-header flex flex-nowrap items-center justify-between gap-2 overflow-x-auto">
          <p className="shrink-0 rounded-full border border-[var(--lp-border)] bg-white px-2.5 py-1.5 text-xs font-semibold tracking-tight sm:px-3 sm:text-sm">
            Design Story Point
          </p>
          <div className="ml-auto flex shrink-0 flex-nowrap items-center justify-end gap-1.5 sm:gap-2">
            <Link
              href="/start?mode=host"
              className="btn-primary inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs whitespace-nowrap sm:gap-1.5 sm:px-4 sm:text-sm"
            >
              <Share2 size={14} className="shrink-0 sm:size-4" aria-hidden />
              発行
            </Link>
            <Link
              href="/start?mode=join"
              className="btn-secondary inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs whitespace-nowrap sm:gap-1.5 sm:px-4 sm:text-sm"
            >
              <UserPlus size={14} className="shrink-0 sm:size-4" aria-hidden />
              参加
            </Link>
          </div>
        </div>
      </header>

      <div className="lp-main">
        {/* 1. 最優先: 二択CTA */}
        <section
          className="lp-shell flex min-h-[calc(100dvh-5.5rem)] flex-col justify-center gap-8 pb-10 pt-4 md:min-h-[calc(100dvh-6rem)] md:gap-10 md:pb-14 md:pt-6"
          aria-labelledby="lp-hero-title"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-caption font-medium text-[var(--muted-foreground)]">Design Story Point</p>
            <h1 id="lp-hero-title" className="mt-2 text-balance text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-4xl">
              タスク見積もりを、チームで揃える。
            </h1>
            <p className="text-body mx-auto mt-3 max-w-xl text-[var(--muted-foreground)]">プランニングポーカーで最短合意形成。</p>
          </div>

          <div className="mx-auto grid w-full max-w-4xl gap-3 sm:grid-cols-2 sm:gap-4">
            <Link
              href="/start?mode=host"
              className="group relative flex min-h-[11.5rem] flex-col justify-between overflow-hidden rounded-3xl bg-[var(--foreground)] p-6 text-left text-white shadow-lg transition hover:opacity-[0.97] md:min-h-[13rem] md:p-8"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
                  <Share2 size={14} aria-hidden />
                  ホスト
                </span>
                <p className="mt-4 text-xl font-bold leading-snug md:text-2xl">ルームを発行</p>
                <p className="mt-2 text-sm leading-relaxed text-white/85">ルームを発行し、チームを招待する</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                発行する
                <ArrowRight size={18} className="transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>

            <Link
              href="/start?mode=join"
              className="group relative flex min-h-[11.5rem] flex-col justify-between overflow-hidden rounded-3xl border-2 border-[var(--foreground)] bg-white p-6 text-left text-[var(--foreground)] shadow-md transition hover:bg-[var(--lp-bg)] md:min-h-[13rem] md:p-8"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--lp-border)] bg-[var(--lp-bg)] px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)]">
                  <UserPlus size={14} aria-hidden />
                  参加者
                </span>
                <p className="mt-4 text-xl font-bold leading-snug md:text-2xl">ルームに参加</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">共有されたルームID・リンクから入る</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                参加する
                <ArrowRight size={18} className="transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </div>
        </section>

        {/* 2. 使い方 3ステップ */}
        <section className="lp-shell lp-section border-t border-[var(--lp-border)] pt-10 md:pt-14" aria-labelledby="lp-howto-title">
          <h2 id="lp-howto-title" className="section-title">
            使い方（3ステップ）
          </h2>

          <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-5">
            {howToSteps.map((item, index) => (
              <li key={item.step}>
                <article className="card-shadow flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--lp-border)] bg-white">
                  <div className="relative aspect-[4/3] w-full bg-white">
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain p-4"
                      priority={index === 0}
                    />
                  </div>
                  <div className="flex flex-1 flex-col border-t border-[var(--lp-border)] p-5">
                    <p className="text-caption font-medium text-[var(--muted-foreground)]">{item.step}</p>
                    <h3 className="heading-sm mt-1 text-lg">{item.title}</h3>
                    <p className="text-caption mt-2 flex-1 leading-relaxed">{item.description}</p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </section>

        {/* 3. メリット（旧・主要機能） */}
        <section className="lp-shell lp-section-lg pb-4" aria-labelledby="lp-benefits-title">
          <h2 id="lp-benefits-title" className="section-title">
            メリット
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {features.map((feature) => {
              const FeatureIcon = feature.Icon;
              return (
                <article key={feature.title} className="rounded-2xl border border-[var(--lp-border)] bg-white p-4">
                  <div className="flex gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--lp-border)] bg-[var(--lp-bg)] text-[var(--foreground)]"
                      aria-hidden
                    >
                      <FeatureIcon size={20} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="heading-sm">{feature.title}</h3>
                      <p className="text-caption mt-2">{feature.body}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-10 rounded-3xl border border-[var(--lp-border)] bg-[var(--lp-muted-card)] p-6 md:p-8">
            <p className="heading-md">今すぐに最初の見積もりセッションを始められます。</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/start?mode=host" className="btn-primary inline-flex rounded-full px-5 py-2.5 text-sm">
                ルームを発行
              </Link>
              <Link href="/start?mode=join" className="btn-secondary inline-flex rounded-full px-5 py-2.5 text-sm">
                ルームに参加
              </Link>
            </div>
          </div>
        </section>

        {/* SEO / 説明（検索・初見向け） */}
        <section
          className="lp-shell lp-section-lg border-t border-[var(--lp-border)] pb-2 pt-10 md:pt-14"
          aria-labelledby="lp-about-title"
        >
          <h2 id="lp-about-title" className="section-title">
            プランニングポーカー（ストーリーポイント）とは
          </h2>
          <div className="mt-4 max-w-3xl space-y-4 text-body text-[var(--muted-foreground)]">
            <p>
              プランニングポーカーは、チーム全員が同時にカードで見積もりを出し、差分を話して合意する手法です。本サービスはブラウザだけでルームを共有でき、デザインタスクや開発タスクの相対的な重さをフィボナッチ数列で揃えやすくします。
            </p>
            <h3 className="heading-sm text-[var(--foreground)]">こんなチーム向け</h3>
            <p>
              デザイナー・エンジニア・PM がオンラインでスプリント見積もりや設計レビューの前に認識を合わせたい場合に適しています。タスクに Figma や GitHub Issue の URL を添えておくと、議論のたたき台になります。
            </p>
            <h3 className="heading-sm text-[var(--foreground)]">利用の流れ</h3>
            <ol className="list-inside list-decimal space-y-2">
              <li>ホストがルームを発行し、招待用リンクを共有する。</li>
              <li>参加者が名前を入れて入室し、ホストがタスク名を設定して投票を開始する。</li>
              <li>全員が投票したら結果を開示し、決定ポイントを保存する。履歴は CSV でダウンロードできます。プレミアム向けの Notion 連携は近日公開予定です。</li>
            </ol>
          </div>
        </section>
      </div>

      <footer className="lp-shell border-t border-[var(--lp-border)] py-6">
        <div className="flex flex-col gap-3 text-xs text-[var(--muted-foreground)] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Design Story Point</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="link-muted">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="link-muted">
              利用規約
            </Link>
            <Link href="/contact" className="link-muted">
              お問い合わせ
            </Link>
            <Link href="/pricing" className="link-muted">
              料金・プレミアム
            </Link>
            <Link href="/premium/notion" className="link-muted">
              Notion 連携（近日公開）
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
