import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--lp-bg)] px-6 text-center">
      <div>
        <p className="text-sm font-medium text-[var(--muted-foreground)]">404</p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--foreground)]">ページが見つかりません</h1>
        <p className="mt-2 max-w-md text-body text-[var(--muted-foreground)]">
          URL が間違っているか、ページが移動した可能性があります。トップからルームを発行するか、招待リンクを確認してください。
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary rounded-full px-5 py-2.5 text-sm">
          トップへ
        </Link>
        <Link href="/start" className="btn-secondary rounded-full px-5 py-2.5 text-sm">
          ルーム作成・参加
        </Link>
      </div>
    </main>
  );
}
