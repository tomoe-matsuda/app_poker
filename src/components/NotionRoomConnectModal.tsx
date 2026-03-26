"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, Loader2, Shield, Sparkles, X } from "lucide-react";
import { saveNotionRoomMeta, clearNotionRoomMeta } from "@/lib/notion-room-meta";

export type NotionTaskRow = {
  pageId: string;
  title: string;
  url: string | null;
  points: number | null;
};

const premiumRequired = process.env.NEXT_PUBLIC_PREMIUM_REQUIRED_FOR_NOTION === "true";
const notionPremiumLive = process.env.NEXT_PUBLIC_PREMIUM_NOTION_LIVE === "true";

/** リリース前は Checkout を無効化（ボタンは表示のみ） */
const checkoutDisabledPreRelease = true;

function applyRowsAfterFetch(
  rows: NotionTaskRow[],
  setRows: (r: NotionTaskRow[]) => void,
  setSelectedPageId: (id: string) => void,
  onApplyTask: (row: NotionTaskRow) => void,
  setMessage: (m: { type: "ok" | "err"; text: string } | null) => void,
  countLabel: string
): void {
  setRows(rows);
  const idx = rows.findIndex((r) => r.points == null || r.points === 0);
  if (idx < 0) {
    setSelectedPageId(rows[0]?.pageId ?? "");
    setMessage({
      type: "ok",
      text: `取得しました（${countLabel}）。すべてのタスクにポイントが入っています。一覧から選んで「フォームに反映」してください。`,
    });
    return;
  }
  const row = rows[idx]!;
  setSelectedPageId(row.pageId);
  onApplyTask(row);
  setMessage({
    type: "ok",
    text: `取得しました（${countLabel}）。未設定のポイントのタスクをタスク欄に入れました。`,
  });
}

export function NotionRoomConnectModal({
  open,
  onClose,
  roomId,
  onApplyTask,
  isPremium,
  notionOAuth,
  onRefreshPremium,
}: {
  open: boolean;
  onClose: () => void;
  roomId: string;
  onApplyTask: (row: NotionTaskRow) => void;
  isPremium: boolean;
  notionOAuth: boolean;
  onRefreshPremium?: () => void;
}) {
  const [databaseId, setDatabaseId] = useState("");
  const [titleProperty, setTitleProperty] = useState("Name");
  const [urlProperty, setUrlProperty] = useState("");
  const [pointsProperty, setPointsProperty] = useState("");
  const [rows, setRows] = useState<NotionTaskRow[]>([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false); // リリース後に checkout 有効化時に使用
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      setRows([]);
      setSelectedPageId("");
      setMessage(null);
    }
  }, [open]);

  const saveMetaForOAuthPush = () => {
    saveNotionRoomMeta(roomId, {
      databaseId: databaseId.trim(),
      titleProperty: titleProperty.trim(),
      urlProperty: urlProperty.trim(),
      pointsProperty: pointsProperty.trim(),
    });
  };

  const handleFetchOAuth = async () => {
    setMessage(null);
    const dbId = databaseId.trim();
    const pp = pointsProperty.trim();
    if (!dbId || !pp) {
      setMessage({ type: "err", text: "データベース ID とポイント列名は必須です。" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/notion/oauth/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          databaseId: dbId,
          titleProperty: titleProperty.trim() || undefined,
          urlProperty: urlProperty.trim() || undefined,
          pointsProperty: pp,
        }),
      });
      const data = (await res.json()) as { ok: boolean; rows?: NotionTaskRow[]; message?: string };
      if (!data.ok || !data.rows) {
        setMessage({ type: "err", text: data.message || "取得に失敗しました。" });
        return;
      }
      applyRowsAfterFetch(data.rows, setRows, setSelectedPageId, onApplyTask, setMessage, `${data.rows.length} 件`);
      saveMetaForOAuthPush();
    } catch {
      setMessage({ type: "err", text: "通信に失敗しました。" });
    } finally {
      setLoading(false);
    }
  };

  const handleApplySelection = () => {
    const row = rows.find((r) => r.pageId === selectedPageId);
    if (!row) return;
    onApplyTask(row);
    if (notionPremiumLive && notionOAuth && isPremium) {
      saveMetaForOAuthPush();
    }
    setMessage({ type: "ok", text: "タスク欄を更新しました。" });
  };

  const handleDisconnectOAuth = async () => {
    try {
      await fetch("/api/notion/oauth/logout", { method: "POST", credentials: "include" });
      clearNotionRoomMeta(roomId);
      setRows([]);
      onRefreshPremium?.();
      setMessage({ type: "ok", text: "Notion OAuth をこのブラウザから切り離しました。" });
    } catch {
      setMessage({ type: "err", text: "切断に失敗しました。" });
    }
  };

  const startCheckout = async () => {
    setMessage(null);
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; url?: string; message?: string };
      if (data.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setMessage({ type: "err", text: data.message || "Checkout を開始できませんでした。" });
    } catch {
      setMessage({ type: "err", text: "通信に失敗しました。" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const startOAuth = () => {
    const state = `/room/${roomId}`;
    window.location.href = `/api/notion/oauth/authorize?state=${encodeURIComponent(state)}`;
  };

  const lockNotionToPremium = premiumRequired && !isPremium;
  const showLiveIntegration = notionPremiumLive && isPremium;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="notion-modal-title">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[var(--lp-border)] bg-[var(--lp-bg)] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 shrink-0 text-[var(--foreground)]" aria-hidden />
            <h2 id="notion-modal-title" className="heading-md">
              Notion 連携
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]" aria-label="閉じる">
            <X size={20} />
          </button>
        </div>

        {lockNotionToPremium ? (
          <div className="mt-4 space-y-4">
            <ComingSoonTeaser />
            <div className="rounded-2xl border border-[var(--lp-border)] bg-white p-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">プレミアムで利用予定</p>
              <p className="text-caption mt-2 leading-relaxed">公開設定では未課金の方への従来方式（ブラウザにシークレットを保存する方法）は提供していません。</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={checkoutDisabledPreRelease || checkoutLoading}
                  onClick={startCheckout}
                  title="リリース前のため、まだお申し込みいただけません"
                  className="btn-primary inline-flex justify-center rounded-full px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                  カードで申し込む
                </button>
                <Link href="/pricing" className="btn-secondary inline-flex justify-center rounded-full px-4 py-2.5 text-sm">
                  料金を見る
                </Link>
              </div>
            </div>
          </div>
        ) : !notionPremiumLive ? (
          <div className="mt-4 space-y-4">
            <ComingSoonTeaser />
            {!isPremium ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={checkoutDisabledPreRelease || checkoutLoading}
                  onClick={startCheckout}
                  title="リリース前のため、まだお申し込みいただけません"
                  className="btn-primary inline-flex justify-center rounded-full px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                  プレミアムに登録する
                </button>
                <Link href="/pricing" className="btn-secondary inline-flex justify-center rounded-full px-4 py-2.5 text-sm">
                  料金ページ
                </Link>
              </div>
            ) : (
              <p className="text-caption text-[var(--muted-foreground)]">リリース後はこの画面からそのまま連携できる予定です。環境変数 NEXT_PUBLIC_PREMIUM_NOTION_LIVE=true で先行お試しできます。</p>
            )}
          </div>
        ) : (
          <>
            <p className="text-caption mt-3 leading-relaxed">
              プレミアム向け: Notion OAuth でトークンは httpOnly Cookie に保存されます。
            </p>

            {!isPremium ? (
              <div className="mt-4 rounded-2xl border border-[var(--lp-border)] bg-white p-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">プレミアムが必要です</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={checkoutDisabledPreRelease || checkoutLoading}
                    onClick={startCheckout}
                    title="リリース前のため、まだお申し込みいただけません"
                    className="btn-primary inline-flex justify-center rounded-full px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                    カードで申し込む
                  </button>
                  <Link href="/pricing" className="btn-secondary inline-flex justify-center rounded-full px-4 py-2.5 text-sm">
                    詳細
                  </Link>
                </div>
              </div>
            ) : null}

            {isPremium && !notionOAuth ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-950">Notion でログイン</p>
                <p className="text-caption mt-2 text-amber-950/90">Notion の公式画面で許可すると、トークンは httpOnly Cookie に保存されます。</p>
                <button type="button" onClick={startOAuth} className="btn-primary mt-3 w-full rounded-full py-2.5 text-sm">
                  Notion で認証する
                </button>
              </div>
            ) : null}

            {isPremium && notionOAuth ? (
              <p className="text-caption mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-900">Notion OAuth 接続済み。データベース ID と列名を入力して取得してください。</p>
            ) : null}

            {showLiveIntegration && notionOAuth ? (
              <>
                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="text-label">データベース ID</span>
                    <input value={databaseId} onChange={(e) => setDatabaseId(e.target.value)} className="input-field mt-1 w-full font-mono text-sm" />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-label">タイトル列（任意）</span>
                      <input value={titleProperty} onChange={(e) => setTitleProperty(e.target.value)} className="input-field mt-1 w-full text-sm" />
                    </label>
                    <label className="block">
                      <span className="text-label">URL 列名（任意）</span>
                      <input value={urlProperty} onChange={(e) => setUrlProperty(e.target.value)} className="input-field mt-1 w-full text-sm" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-label">ストーリーポイント列（必須）</span>
                    <input value={pointsProperty} onChange={(e) => setPointsProperty(e.target.value)} className="input-field mt-1 w-full text-sm" />
                  </label>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <button type="button" disabled={loading} onClick={handleFetchOAuth} className="btn-primary inline-flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                    取得してタスク欄に反映
                  </button>
                  <button type="button" onClick={handleDisconnectOAuth} className="btn-secondary text-sm">
                    Notion 連携を切る
                  </button>
                </div>
              </>
            ) : null}
          </>
        )}

        {message ? (
          <p className={`mt-4 rounded-2xl px-3 py-2 text-sm ${message.type === "ok" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"}`} role="status">
            {message.text}
          </p>
        ) : null}

        {rows.length > 0 && showLiveIntegration && notionOAuth ? (
          <div className="mt-6 border-t border-[var(--lp-border)] pt-4">
            <label className="text-label block">タスクを選び直す</label>
            <select value={selectedPageId} onChange={(e) => setSelectedPageId(e.target.value)} className="input-field mt-2 w-full py-2 text-sm">
              {rows.map((r) => (
                <option key={r.pageId} value={r.pageId}>
                  {r.title}
                  {r.points != null && r.points !== 0 ? `（現在 ${r.points} pt）` : ""}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleApplySelection} className="btn-secondary mt-3 w-full text-sm sm:w-auto">
              選択したタスクをフォームに反映
            </button>
          </div>
        ) : null}

      </div>
    </div>
  );
}

function ComingSoonTeaser() {
  return (
    <div className="rounded-2xl border border-[var(--lp-border)] bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 text-[var(--foreground)]">
        <Sparkles className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
        <span className="text-sm font-bold">近日リリース予定</span>
      </div>
      <p className="text-caption mt-3 leading-relaxed text-[var(--muted-foreground)]">
        プレミアム向けの <strong className="text-[var(--foreground)]">Notion API 連携</strong>
        を準備中です。OAuth による安全な認証のうえ、次のようなことができる予定です。
      </p>
      <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
        <li className="flex gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
          インテグレーションシークレットをブラウザに置かず、公式の許可フローだけで接続
        </li>
        <li className="flex gap-2">
          <Database className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
          データベースからタスク一覧を取得し、タスク名・URL をルームに自動入力
        </li>
        <li className="flex gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
          合意したストーリーポイントを Notion の数値プロパティへ自動反映
        </li>
      </ul>
    </div>
  );
}
