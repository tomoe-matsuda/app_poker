import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "Design Story Point の個人情報・Cookie・解析ツールの取り扱いについて",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--lp-bg)] px-6 py-12 text-[var(--foreground)]">
      <article className="mx-auto max-w-2xl space-y-6">
        <h1 className="heading-lg">プライバシーポリシー</h1>
        <p className="text-caption">最終更新日: {new Date().getFullYear()}年3月26日</p>

        <section className="space-y-3 text-body text-[var(--muted-foreground)]">
          <h2 className="heading-sm text-[var(--foreground)]">1. 取得する情報</h2>
          <p>
            本サービスでは、ルーム参加時に入力いただく表示名、ルーム内の投票内容・タスク名・任意で入力された
            URL（Figma / GitHub 等）が、運用サービス（Firebase / Firestore）に保存されます。ルーム ID
            は URL から推測可能な形式です。
          </p>
        </section>

        <section className="space-y-3 text-body text-[var(--muted-foreground)]">
          <h2 className="heading-sm text-[var(--foreground)]">2. アクセス解析（Google Analytics 4）</h2>
          <p>
            サイトの利用状況把握のため、Google LLC 提供の Google Analytics 4（GA4）を利用する場合があります。
            Cookie により匿名のトラフィックデータが収集されることがあります。ブラウザの設定や Google
            が提供するオプトアウト手段で制限できます。
          </p>
        </section>

        <section className="space-y-3 text-body text-[var(--muted-foreground)]">
          <h2 className="heading-sm text-[var(--foreground)]">3. Notion 連携（プレミアム）</h2>
          <p>
            プレミアム向け Notion 連携では、OAuth 完了後のアクセストークンを httpOnly Cookie に保存し、サーバー経由で
            Notion API と通信する方式を想定しています。管理者用の環境変数連携（/notion ページ等）を別途利用する場合は、サーバー側のみがシークレットを保持します。
          </p>
        </section>

        <section className="space-y-3 text-body text-[var(--muted-foreground)]">
          <h2 className="heading-sm text-[var(--foreground)]">4. お問い合わせ</h2>
          <p>
            個人情報の取り扱いに関するお問い合わせは、
            <Link href="/contact" className="link-muted underline underline-offset-2">
              お問い合わせページ
            </Link>
            からご連絡ください。
          </p>
        </section>

        <Link href="/" className="btn-secondary inline-flex rounded-full px-5 py-2.5 text-sm">
          トップへ
        </Link>
      </article>
    </main>
  );
}
