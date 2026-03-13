"use client";

import { ExternalLink, Download, FileSpreadsheet, RotateCcw } from "lucide-react";
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
      <div className="flex items-center justify-between mb-[var(--section-title-margin)]">
        <h2 className="section-title mb-0">
          完了したタスク ({history.length})
        </h2>
        <button
          onClick={onDownloadCSV}
          className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
        >
          <Download size={16} />
          CSVダウンロード
        </button>
      </div>

      {/* Task List */}
      <div className="section-content gap-2">
        {history.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[var(--background)] card-shadow"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <span className="text-[var(--muted-foreground)] text-sm font-mono w-6">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.taskName}</p>
                {item.figmaUrl && (
                  <a
                    href={item.figmaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm link-muted inline-flex items-center gap-1 mt-0.5"
                  >
                    <ExternalLink size={12} />
                    <span>リンクを開く</span>
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="point-badge">
                {item.finalPoint}
              </div>
              {isHost && (
                <button
                  onClick={() => onRetry(item)}
                  className="p-2 link-muted hover:bg-[var(--muted)] rounded-xl transition-colors"
                  title="やり直す"
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[var(--muted)] mt-[var(--content-gap)]">
        <span className="font-medium text-[var(--muted-foreground)]">合計ポイント</span>
        <span className="font-bold text-xl">{totalPoints}</span>
      </div>

      {/* Footer Note */}
      <p className="text-caption flex items-center gap-1 pt-1 mt-2">
        <FileSpreadsheet size={12} />
        CSVはExcelやNotionにインポートできます
      </p>
    </section>
  );
}
