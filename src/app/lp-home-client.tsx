"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Link2, ListChecks, Share2 } from "lucide-react";

const features = [
  {
    title: "タスクごとのポイント設定",
    body: "チームで相対評価し、判断基準をそろえます。",
  },
  {
    title: "リンク共有で議論を活性化",
    body: "FigmaやIssueをタスクに紐づけて話しやすく。",
  },
  {
    title: "結果をデータ化して連携",
    body: "決定内容を整理し、外部ツール連携へつなげます。",
  },
];

const howToSlides = [
  {
    step: "STEP 1",
    title: "ルームを発行して共有",
    description: "ホストがルームを作成し、参加リンクをチームへ共有します。",
    Icon: Share2,
    chips: ["ルーム作成", "リンク共有"],
  },
  {
    step: "STEP 2",
    title: "タスクを設定して見積もる",
    description: "タスクごとにポイントを提示し、差分を話して認識をそろえます。",
    Icon: ListChecks,
    chips: ["タスク設定", "ポイント提示"],
  },
  {
    step: "STEP 3",
    title: "決定内容を外部連携",
    description: "合意したポイントを記録し、必要なツールへ連携します。",
    Icon: Link2,
    chips: ["記録", "外部連携"],
  },
];

export function LpHomeClient() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const current = howToSlides[currentSlide];
  const CurrentIcon = current.Icon;

  const moveSlide = (delta: number) => {
    setCurrentSlide((prev) => (prev + delta + howToSlides.length) % howToSlides.length);
  };

  return (
    <main className="min-h-screen bg-[#fffdfa] pt-28 text-[var(--foreground)] md:pt-32">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#efe6e0] bg-[#fffdfa]/95 backdrop-blur-sm">
        <div className="lp-shell lp-header flex flex-wrap items-center justify-between gap-3">
          <p className="rounded-full border border-[#efe6e0] bg-white px-3 py-1.5 text-sm font-semibold tracking-tight">
            Design Story Point
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link href="/start?mode=join" className="rounded-full px-4 py-2 text-sm text-[var(--foreground)] hover:opacity-80">
              ルームに参加
            </Link>
            <Link href="/start?mode=host" className="btn-primary rounded-full px-5 py-2 text-sm">
              ルームを発行
            </Link>
          </div>
        </div>
      </header>

      <div className="lp-shell lp-main">
        <section className="lp-hero grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="section-content">
            <p className="text-caption">デザイナー向けプランニングポーカー</p>
            <h1 className="heading-lg">デザイン見積もりを、チームで揃える。</h1>
            <p className="text-body max-w-xl text-[var(--muted-foreground)]">
              Design Story Pointで、相対見積もりと合意形成をスムーズに。
            </p>
          </div>

          <div className="card-shadow rounded-3xl border border-[#efe6e0] bg-white p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-label">使い方</p>
                <div className="flex items-center gap-1.5">
                  {howToSlides.map((slide, index) => (
                    <button
                      key={slide.step}
                      type="button"
                      aria-label={`${slide.step}へ移動`}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 w-4 rounded-full transition ${index === currentSlide ? "bg-[var(--foreground)]" : "bg-[#d6dbe8]"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#e6ebf4] bg-[#f5f8ff] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-caption">{current.step}</p>
                  <CurrentIcon size={18} aria-hidden />
                </div>
                <p className="text-base font-semibold">{current.title}</p>
                <p className="text-caption mt-2">{current.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {current.chips.map((chip) => (
                    <span key={chip} className="rounded-full border border-[#d7deed] bg-white px-2.5 py-1 text-xs text-[var(--muted-foreground)]">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button type="button" onClick={() => moveSlide(-1)} className="btn-secondary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm">
                  <ChevronLeft size={16} />
                  前へ
                </button>
                <button type="button" onClick={() => moveSlide(1)} className="btn-secondary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm">
                  次へ
                  <ChevronRight size={16} />
                </button>
              </div>

              <Link href="/start?mode=host" className="btn-primary mt-1 block rounded-full text-center text-sm">
                ルームを発行（無料）
              </Link>
            </div>
          </div>
        </section>

        <section className="lp-section">
          <div className="lp-copy-frame">
            <p className="lp-problem-bubble">見積もりの基準が揃わず、議論が長引いていませんか？</p>
          </div>
          <h2 className="section-title">Story Pointで相対評価する</h2>
          <p className="text-body max-w-3xl text-[var(--muted-foreground)]">
            複雑さや不確実性を相対的に評価。チーム全員の認識差を減らし、納得感のある意思決定を短時間で進められます。
          </p>
        </section>

        <section className="lp-section">
          <h2 className="section-title">主要機能</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-[#efe6e0] bg-white p-4">
                <h3 className="heading-sm">{feature.title}</h3>
                <p className="text-caption mt-2">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-section-lg">
          <div className="rounded-3xl border border-[#efe6e0] bg-[#fff4ef] p-6">
            <h2 className="section-title">今すぐ開始</h2>
            <p className="text-caption">最短30秒で、最初の見積もりセッションを始められます。</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/start?mode=host" className="btn-primary inline-flex rounded-full text-sm">
                ルームを発行
              </Link>
              <Link href="/start?mode=join" className="rounded-full border border-[#efe6e0] bg-white px-5 py-2 text-sm hover:bg-[#fff9f6]">
                ルームに参加
              </Link>
            </div>
          </div>
        </section>
      </div>

      <footer className="lp-shell border-t border-[#e8e2dc] py-6">
        <div className="flex flex-col gap-2 text-xs text-[var(--muted-foreground)] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Design Story Point</p>
          <div className="flex items-center gap-4">
            <a href="#" className="link-muted">
              Privacy
            </a>
            <a href="#" className="link-muted">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
