"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

function PremiumSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"loading" | "ok" | "err">("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      queueMicrotask(() => {
        setState("err");
        setMsg("セッション ID がありません。");
      });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/stripe/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = (await res.json()) as { ok?: boolean; message?: string };
        if (cancelled) return;
        if (data.ok) {
          setState("ok");
          setMsg("プレミアムが有効になりました。ルームで Notion を OAuth 接続できます。");
          return;
        }
        setState("err");
        setMsg(data.message || "検証に失敗しました。");
      } catch {
        if (!cancelled) {
          setState("err");
          setMsg("通信に失敗しました。");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--lp-bg)] px-6 py-16 text-center">
      {state === "loading" ? (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-[var(--muted-foreground)]" aria-hidden />
          <p className="mt-4 text-[var(--muted-foreground)]">決済を確認しています…</p>
        </>
      ) : null}
      {state === "ok" ? (
        <>
          <CheckCircle2 className="h-14 w-14 text-emerald-600" aria-hidden />
          <h1 className="heading-md mt-4">ありがとうございます</h1>
          <p className="text-body mx-auto mt-2 max-w-md text-[var(--muted-foreground)]">{msg}</p>
          <Link href="/start" className="btn-primary mt-8 rounded-full px-6 py-3 text-sm">
            ルームへ
          </Link>
        </>
      ) : null}
      {state === "err" ? (
        <>
          <XCircle className="h-14 w-14 text-red-500" aria-hidden />
          <h1 className="heading-md mt-4">確認できませんでした</h1>
          <p className="text-body mx-auto mt-2 max-w-md text-red-800">{msg}</p>
          <Link href="/pricing" className="btn-secondary mt-8 rounded-full px-6 py-3 text-sm">
            料金ページへ
          </Link>
        </>
      ) : null}
      <button type="button" onClick={() => router.push("/")} className="text-caption mt-6 link-muted underline underline-offset-2">
        トップへ
      </button>
    </main>
  );
}

export default function PremiumSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[var(--lp-bg)]">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--muted-foreground)]" aria-hidden />
        </main>
      }
    >
      <PremiumSuccessInner />
    </Suspense>
  );
}
