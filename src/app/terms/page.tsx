import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約",
  description: "Design Story Point の利用条件について",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--lp-bg)] px-6 py-12 text-[var(--foreground)]">
      <article className="mx-auto max-w-2xl space-y-6">
        <h1 className="heading-lg">利用規約</h1>
        <p className="text-caption">最終更新日: {new Date().getFullYear()}年3月26日</p>

        <section className="space-y-3 text-body text-[var(--muted-foreground)]">
          <h2 className="heading-sm text-[var(--foreground)]">1. サービス内容</h2>
          <p>
            Design Story Point（本サービス）は、オンラインでのプランニングポーカー（ストーリーポイント見積もり）を行うためのツールです。予告なく機能変更・中断・終了することがあります。
          </p>
        </section>

        <section className="space-y-3 text-body text-[var(--muted-foreground)]">
          <h2 className="heading-sm text-[var(--foreground)]">2. 禁止事項</h2>
          <p>法令違反、他者の権利侵害、サーバーへの過度な負荷、不正アクセス、迷惑行為などを禁止します。</p>
        </section>

        <section className="space-y-3 text-body text-[var(--muted-foreground)]">
          <h2 className="heading-sm text-[var(--foreground)]">3. 免責</h2>
          <p>
            本サービスの利用により生じた損害について、運営者に故意または重過失がある場合を除き、責任を負いません。ルームは URL
            を知る者が参加できる設計のため、機密情報の取り扱いは利用者の責任で行ってください。
          </p>
        </section>

        <section className="space-y-3 text-body text-[var(--muted-foreground)]">
          <h2 className="heading-sm text-[var(--foreground)]">4. 準拠法</h2>
          <p>本規約は日本法に準拠します。</p>
        </section>

        <Link href="/" className="btn-secondary inline-flex rounded-full px-5 py-2.5 text-sm">
          トップへ
        </Link>
      </article>
    </main>
  );
}
