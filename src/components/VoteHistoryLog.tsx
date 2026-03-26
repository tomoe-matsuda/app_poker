"use client";

import { ExternalLink, Download, RotateCcw } from "lucide-react";
import type { VoteHistory } from "@/types";

interface VoteHistoryLogProps {
  history: VoteHistory[];
  onDownloadCSV: () => void;
  onRetry: (item: VoteHistory) => void;
  isHost: boolean;
}

export function VoteHistoryLog({
  history,
  onDownloadCSV,
  onRetry,
  isHost,
}: VoteHistoryLogProps) {
  if (history.length === 0) {
    return null;
  }

  const totalPoints = history.reduce((sum, h) => sum + h.finalPoint, 0);

  return (
    <section className="section">
      {/* Header */}
      <div className="mb-[var(--section-title-margin)] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="section-title mb-0">完了したタスク ({history.length})</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <button
            type="button"
            onClick={onDownloadCSV}
            className="btn-secondary flex w-full items-center justify-center gap-2 px-4 py-2 text-sm sm:w-auto"
          >
            <Download size={16} aria-hidden />
            CSVダウンロード
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="section-content gap-2">
        {history.map((item, index) => (
          <div
            key={item.id}
            className="card-shadow grid grid-cols-1 gap-3 rounded-2xl bg-[var(--background)] px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4"
          >
            <div className="flex min-w-0 flex-wrap items-start gap-3 sm:items-center">
              <span className="shrink-0 font-mono text-sm text-[var(--muted-foreground)] tabular-nums">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 basis-[12rem]">
                <p className="font-medium break-words">{item.taskName}</p>
                {item.figmaUrl && (
                  <a
                    href={item.figmaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-muted mt-0.5 inline-flex max-w-full items-center gap-1 break-all text-sm"
                  >
                    <ExternalLink size={12} className="shrink-0" aria-hidden />
                    <span>リンクを開く</span>
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:justify-end sm:gap-2">
              <div className="point-badge shrink-0">{item.finalPoint}</div>
              {isHost && (
                <button
                  type="button"
                  onClick={() => onRetry(item)}
                  className="link-muted shrink-0 rounded-xl p-2 transition-colors hover:bg-[var(--muted)]"
                  title="やり直す"
                >
                  <RotateCcw size={16} aria-hidden />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-[var(--content-gap)] flex items-center justify-between rounded-2xl bg-[var(--muted)] px-4 py-3">
        <span className="font-medium text-[var(--muted-foreground)]">合計ポイント</span>
        <span className="text-xl font-bold">{totalPoints}</span>
      </div>
    </section>
  );
}
