import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "Design Story Point へのお問い合わせ",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--lp-bg)] px-6 py-12 text-[var(--foreground)]">
      <article className="mx-auto max-w-lg space-y-6">
        <h1 className="heading-lg">お問い合わせ</h1>
        <p className="text-body text-[var(--muted-foreground)]">
          不具合・ご要望・プライバシーに関するご連絡は、GitHub リポジトリの Issues または運営者が公開している連絡手段をご利用ください。
        </p>
        <p className="text-caption">
          リポジトリ例:{" "}
          <a
            href="https://github.com/tomoe-matsuda/storypointpoker_app_lp"
            className="link-muted break-all underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/tomoe-matsuda/storypointpoker_app_lp
          </a>
        </p>
        <Link href="/" className="btn-secondary inline-flex rounded-full px-5 py-2.5 text-sm">
          トップへ
        </Link>
      </article>
    </main>
  );
}
