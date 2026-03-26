"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import type { NotionDatabaseRow } from "@/types/notion";
import { updateNotionDatabaseRowAction } from "./actions";

type Props = {
  initialRows: NotionDatabaseRow[];
};

export function NotionRowsEditor({ initialRows }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasNumber = useMemo(() => rows.some((r) => r.numberProperty), [rows]);
  const hasDate = useMemo(() => rows.some((r) => r.dateProperty), [rows]);

  const updateLocal = (pageId: string, patch: Partial<Pick<NotionDatabaseRow, "numberValue" | "dateValue">>) => {
    setRows((prev) =>
      prev.map((r) => (r.pageId === pageId ? { ...r, ...patch } : r))
    );
  };

  const handleSave = (row: NotionDatabaseRow) => {
    setMessage(null);
    setPendingId(row.pageId);
    startTransition(async () => {
      const res = await updateNotionDatabaseRowAction(row.pageId, {
        number: hasNumber ? row.numberValue : undefined,
        date: hasDate ? row.dateValue : undefined,
      });
      setPendingId(null);
      if (res.ok) {
        setMessage({ type: "ok", text: "Notion を更新しました。" });
        router.refresh();
      } else {
        setMessage({ type: "err", text: res.message });
      }
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="heading-lg">Notion データベース連携</h1>
          <p className="text-caption mt-1">
            環境変数の DATABASE_ID に紐づく全行を表示し、設定したプロパティを更新できます。
          </p>
        </div>
        <Link href="/" className="btn-secondary inline-flex shrink-0 justify-center rounded-full px-4 py-2 text-sm">
          トップへ
        </Link>
      </div>

      {message ? (
        <p
          className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"
          }`}
          role="status"
        >
          {message.text}
        </p>
      ) : null}

      {!hasNumber && !hasDate ? (
        <p className="text-caption rounded-2xl border border-[var(--border)] bg-[var(--muted)] px-4 py-3">
          編集用プロパティが未設定です。{" "}
          <code className="text-xs">NOTION_EDITABLE_NUMBER_PROP</code> または{" "}
          <code className="text-xs">NOTION_EDITABLE_DATE_PROP</code> を .env に追加してください。
        </p>
      ) : null}

      <ul className="mt-6 flex flex-col gap-3">
        {rows.map((row) => {
          const saving = isPending && pendingId === row.pageId;
          return (
            <li
              key={row.pageId}
              className="card-shadow rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="min-w-0 space-y-3">
                  <div>
                    <p className="text-label">タイトル</p>
                    <p className="heading-sm mt-0.5 break-words">{row.title}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">{row.pageId}</p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {row.numberProperty ? (
                      <label className="flex flex-col gap-1">
                        <span className="text-caption">{row.numberProperty}</span>
                        <input
                          type="number"
                          className="input-field w-32 py-2"
                          value={row.numberValue ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateLocal(row.pageId, {
                              numberValue: v === "" ? null : Number(v),
                            });
                          }}
                        />
                      </label>
                    ) : null}
                    {row.dateProperty ? (
                      <label className="flex flex-col gap-1">
                        <span className="text-caption">{row.dateProperty}</span>
                        <input
                          type="date"
                          className="input-field py-2"
                          value={row.dateValue ? row.dateValue.slice(0, 10) : ""}
                          onChange={(e) =>
                            updateLocal(row.pageId, {
                              dateValue: e.target.value || null,
                            })
                          }
                        />
                      </label>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSave(row)}
                  disabled={saving || (!row.numberProperty && !row.dateProperty)}
                  className="btn-primary inline-flex items-center justify-center gap-2 self-start sm:self-end"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
                  Notion に保存
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {rows.length === 0 ? (
        <p className="text-caption mt-8 text-center">データベースに行がありません。</p>
      ) : null}
    </div>
  );
}
