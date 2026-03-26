"use client";

import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Check, ExternalLink, RotateCcw, Eye, CircleCheckBig, Users, Crown, Database } from "lucide-react";
import { PointCard } from "@/components/PointCard";
import { VoteHistoryLog } from "@/components/VoteHistoryLog";
import { NotionRoomConnectModal } from "@/components/NotionRoomConnectModal";
import {
  subscribeToRoom,
  updateTask,
  submitVote,
  resetVotes,
  revealVotes,
  saveVoteHistory,
  clearCurrentTask,
  getLocalParticipantId,
  checkRoomAndJoin,
  subscribeToVoteHistory,
  downloadCSV,
  retryTask,
  deleteVoteHistory,
} from "@/lib/room";
import { trackEvent } from "@/lib/analytics";
import { loadNotionRoomMeta } from "@/lib/notion-room-meta";
import { FIBONACCI_POINTS, type Room, type FibonacciPoint, type VoteHistory } from "@/types";

interface RoomPageProps {
  params: Promise<{ id: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const { id: roomId } = use(params);
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskName, setTaskName] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<FibonacciPoint | null>(null);
  const [copied, setCopied] = useState(false);
  const [finalPoint, setFinalPoint] = useState<FibonacciPoint | null>(null);

  const [userName, setUserName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [isHostJoin, setIsHostJoin] = useState(false);

  const [participantId, setParticipantId] = useState<string | null>(null);
  const [voteHistory, setVoteHistory] = useState<VoteHistory[]>([]);
  const [myName, setMyName] = useState<string>("");

  const [notionModalOpen, setNotionModalOpen] = useState(false);
  const [linkedNotionPageId, setLinkedNotionPageId] = useState<string | null>(null);
  const [notionPushHint, setNotionPushHint] = useState<string | null>(null);
  const [premiumFlags, setPremiumFlags] = useState({ premium: false, notionOAuth: false });

  const refreshPremium = useCallback(async () => {
    try {
      const r = await fetch("/api/premium/status", { credentials: "include" });
      const data = (await r.json()) as { premium?: boolean; notionOAuth?: boolean };
      setPremiumFlags({
        premium: Boolean(data.premium),
        notionOAuth: Boolean(data.notionOAuth),
      });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refreshPremium();
  }, [refreshPremium]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    if (q.get("notion_oauth_ok") === "1") {
      void refreshPremium();
      window.history.replaceState({}, "", `/room/${roomId}`);
    }
  }, [roomId, refreshPremium]);

  useEffect(() => {
    if (notionModalOpen) void refreshPremium();
  }, [notionModalOpen, refreshPremium]);

  useEffect(() => {
    const storedId = getLocalParticipantId(roomId);
    setParticipantId(storedId);
    if (storedId) {
      setHasJoined(true);
    }

    if (typeof window !== "undefined") {
      const isHost = localStorage.getItem(`room_${roomId}_isHost`) === "true";
      setIsHostJoin(isHost);
      const storedName = localStorage.getItem(`room_${roomId}_participantName`);
      if (storedName) {
        setMyName(storedName);
      }
    }
  }, [roomId]);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomId, (roomData) => {
      setRoom(roomData);
      setLoading(false);

      if (roomData && participantId) {
        const isStillParticipant = roomData.participants.some(
          (p) => p.id === participantId
        );
        if (!isStillParticipant) {
          setHasJoined(false);
          setParticipantId(null);
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, participantId]);

  useEffect(() => {
    if (!hasJoined) return;

    const unsubscribe = subscribeToVoteHistory(roomId, (history) => {
      setVoteHistory(history);
    });

    return () => unsubscribe();
  }, [roomId, hasJoined]);

  useEffect(() => {
    if (room && participantId) {
      const currentParticipant = room.participants.find(
        (p) => p.id === participantId
      );
      if (currentParticipant && currentParticipant.vote !== null) {
        setSelectedPoint(currentParticipant.vote as FibonacciPoint);
      } else {
        setSelectedPoint(null);
      }
    }
  }, [room, participantId]);

  const isHost = room?.createdBy === participantId || isHostJoin;

  const handleJoinRoom = async (asHost: boolean = false) => {
    if (!userName.trim()) {
      setJoinError("名前を入力してください");
      return;
    }

    setIsJoining(true);
    setJoinError("");

    try {
      const result = await checkRoomAndJoin(roomId, userName.trim(), asHost);
      if (result.success) {
        const newParticipantId = getLocalParticipantId(roomId);
        setParticipantId(newParticipantId);
        setHasJoined(true);
        trackEvent("room_join", { room_id: roomId, as_host: asHost });
        if (asHost && typeof window !== "undefined") {
          localStorage.setItem(`room_${roomId}_isHost`, "true");
          setIsHostJoin(true);
        }
      } else {
        setJoinError(result.error || "参加に失敗しました");
      }
    } catch (err) {
      setJoinError("参加に失敗しました");
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyRoomUrl = async () => {
    const inviteUrl = `${window.location.origin}/start?join=${roomId}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartVoting = async () => {
    if (!taskName.trim()) return;
    await updateTask(
      roomId,
      taskName.trim(),
      figmaUrl.trim() || undefined,
      linkedNotionPageId || undefined
    );
    setLinkedNotionPageId(null);
    setFinalPoint(null);
    setNotionPushHint(null);
  };

  const handleVote = async (point: FibonacciPoint) => {
    if (!participantId || !room?.isVotingOpen) return;
    setSelectedPoint(point);
    await submitVote(roomId, participantId, point);
  };

  const handleReveal = async () => {
    await revealVotes(roomId);
  };

  const handleReset = async () => {
    await resetVotes(roomId);
    setSelectedPoint(null);
    setFinalPoint(null);
  };

  const handleSaveResult = async () => {
    if (!room || !room.currentTask || finalPoint === null || !participantId) return;

    const notionPageId = room.currentTask.notionPageId;
    const savedPoint = finalPoint;

    await saveVoteHistory(
      roomId,
      room.currentTask.name,
      room.currentTask.figmaUrl,
      finalPoint,
      room.participants,
      participantId
    );

    setTaskName("");
    setFigmaUrl("");
    setFinalPoint(null);
    await clearCurrentTask(roomId);
    trackEvent("vote_result_saved", {
      room_id: roomId,
      story_points: finalPoint,
    });

    setNotionPushHint(null);
    if (notionPageId && typeof window !== "undefined") {
      try {
        const stRes = await fetch("/api/premium/status", { credentials: "include" });
        const st = (await stRes.json()) as { premium?: boolean; notionOAuth?: boolean };
        const notionLive = process.env.NEXT_PUBLIC_PREMIUM_NOTION_LIVE === "true";
        if (notionLive && st.premium && st.notionOAuth) {
          const meta = loadNotionRoomMeta(roomId);
          if (meta?.pointsProperty) {
            const res = await fetch("/api/notion/oauth/set-points", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                pageId: notionPageId,
                pointsProperty: meta.pointsProperty,
                value: savedPoint,
              }),
            });
            const data = (await res.json()) as { ok?: boolean; message?: string };
            if (data.ok) {
              setNotionPushHint("Notion のストーリーポイント列も更新しました（OAuth）。");
            } else {
              setNotionPushHint(`Notion OAuth 更新をスキップ: ${data.message ?? res.status}`);
            }
          }
        }
      } catch {
        setNotionPushHint("Notion 更新の通信に失敗しました。");
      }
    }
  };

  const handleDownloadCSV = () => {
    const date = new Date().toISOString().split("T")[0];
    trackEvent("csv_download", { room_id: roomId, row_count: voteHistory.length });
    downloadCSV(voteHistory, `design-story-point_${roomId}_${date}.csv`);
  };

  const handleRetry = async (item: VoteHistory) => {
    setTaskName(item.taskName);
    setFigmaUrl(item.figmaUrl || "");
    await deleteVoteHistory(item.id);
    await retryTask(roomId, item.taskName, item.figmaUrl);
  };

  const calculateStats = () => {
    if (!room) return null;
    const votes = room.participants
      .filter((p) => p.vote !== null)
      .map((p) => p.vote!);

    if (votes.length === 0) return null;

    const average = votes.reduce((a, b) => a + b, 0) / votes.length;
    const min = Math.min(...votes);
    const max = Math.max(...votes);

    return { average: average.toFixed(1), min, max, count: votes.length };
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--lp-bg)]">
        <div className="text-[var(--muted-foreground)]">読み込み中...</div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--lp-bg)] px-6">
        <p className="text-[var(--muted-foreground)]">ルームが見つかりません</p>
        <button type="button" onClick={() => router.push("/")} className="btn-primary">
          トップに戻る
        </button>
      </main>
    );
  }

  if (!hasJoined) {
    const isFull = room.participants.length >= room.maxParticipants;
    const hasHost = room.participants.some((p) => p.isHost);

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--lp-bg)] px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
              <Link
                href="/"
                className="rounded-sm text-inherit no-underline transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
              >
                Design Story Point
              </Link>
            </h1>
            <p className="text-[var(--muted-foreground)]">ルームに参加するには名前を入力してください</p>
          </div>

          <div className="card-shadow space-y-4 rounded-3xl bg-white p-6">
            <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
              <span className="font-mono">Room: {roomId}</span>
              <span className="flex items-center gap-1">
                <Users size={16} />
                {room.participants.length} / {room.maxParticipants}
              </span>
            </div>

            {isFull ? (
              <div className="text-center py-4">
                <p className="text-red-500 font-medium">
                  このルームは満員です
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="btn-secondary mt-4"
                >
                  トップに戻る
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="あなたの名前"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinRoom(false)}
                  className="input-field w-full"
                  autoFocus
                />

                {joinError && (
                  <p className="text-red-500 text-sm text-center">{joinError}</p>
                )}

                {!hasHost ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleJoinRoom(true)}
                      disabled={isJoining}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Crown size={18} />
                      {isJoining ? "参加中..." : "ホスト（親）として参加"}
                    </button>
                    <button
                      onClick={() => handleJoinRoom(false)}
                      disabled={isJoining}
                      className="btn-secondary w-full"
                    >
                      {isJoining ? "参加中..." : "参加者（子）として参加"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoinRoom(false)}
                    disabled={isJoining}
                    className="btn-primary w-full"
                  >
                    {isJoining ? "参加中..." : "参加する"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <footer className="mt-12 text-center">
          <Link href="/" className="link-muted text-sm underline underline-offset-2">
            サイトTOPに戻る
          </Link>
        </footer>
      </main>
    );
  }

  const stats = !room.isVotingOpen ? calculateStats() : null;
  const votedCount = room.participants.filter((p) => p.vote !== null).length;
  const totalCount = room.participants.length;
  const allVoted = totalCount > 0 && votedCount === totalCount;

  return (
    <main className="min-h-screen bg-[var(--lp-bg)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="page-sections mx-auto max-w-4xl">
        {/* Header */}
        <header className="section flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="heading-lg">
                <Link
                  href="/"
                  className="rounded-sm text-inherit no-underline transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
                >
                  Design Story Point
                </Link>
              </h1>
              {isHost && (
                <span className="badge max-w-full truncate">
                  <Crown size={12} />
                  ホスト: {myName}
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-[var(--muted-foreground)]">Room: {roomId}</span>
              <button
                type="button"
                onClick={handleCopyRoomUrl}
                className="flex items-center gap-1 link-muted transition-colors"
                title="参加者用URLをコピー"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
              {isHost ? (
                <button type="button" onClick={() => setNotionModalOpen(true)} className="btn-notion-cta">
                  <Database size={12} aria-hidden />
                  Notion連携
                </button>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2 text-caption">
            <Users size={16} />
            <span>{room.participants.length} / {room.maxParticipants} 人</span>
          </div>
        </header>

        {/* Task Setting Section - Host Only */}
        {isHost && (
          <section className="section card bg-[var(--background)]">
            <h2 className="section-title">タスク設定</h2>
            {notionPushHint ? (
              <p className="text-caption mb-2 rounded-xl bg-amber-50 px-3 py-2 text-amber-950">{notionPushHint}</p>
            ) : null}
            <div className="section-content">
              {linkedNotionPageId && !room.currentTask ? (
                <p className="text-caption flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 font-medium text-[var(--foreground)]">Notion と紐づけ予定</span>
                  <button
                    type="button"
                    className="link-muted underline underline-offset-2"
                    onClick={() => setLinkedNotionPageId(null)}
                  >
                    解除
                  </button>
                </p>
              ) : null}
              <input
                type="text"
                placeholder="タスク名を入力"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="input-field w-full"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <input
                  type="url"
                  placeholder="GitHub or Figma URL（任意）"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  className="input-field w-full flex-1 min-w-0"
                />
                {figmaUrl ? (
                  <a
                    href={figmaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary inline-flex shrink-0 items-center justify-center gap-2 sm:min-w-[7rem]"
                  >
                    <ExternalLink size={18} />
                    開く
                  </a>
                ) : null}
              </div>
              <button
                onClick={handleStartVoting}
                disabled={!taskName.trim()}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                投票を開始
              </button>
            </div>
          </section>
        )}

        {/* Current Task & Voting Section */}
        {room.currentTask && (
          <section className="section">
            {/* Current Task Card */}
            <div className="card-shadow mb-6 rounded-2xl bg-[var(--muted)] p-4 sm:mb-8 sm:p-5">
              <p className="text-label mb-1">現在のタスク</p>
              <p className="heading-sm truncate">{room.currentTask.name}</p>
              {room.currentTask.notionPageId ? (
                <p className="text-caption mt-1 font-medium text-[var(--muted-foreground)]">Notion 行と同期します</p>
              ) : null}
              {room.currentTask.figmaUrl && (
                <a
                  href={room.currentTask.figmaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm link-muted inline-flex items-center gap-1 mt-1"
                >
                  <ExternalLink size={12} />
                  リンクを開く
                </a>
              )}
            </div>

            {/* Voting Header */}
            <div className="mb-6 flex min-w-0 flex-wrap items-center gap-2 sm:mb-8 sm:gap-3">
              <h2 className="section-title mb-0">
                {room.isVotingOpen ? "ポイントを選択" : "投票結果"}
              </h2>
              {room.isVotingOpen && (
                <span className="badge-outline shrink-0">
                  {votedCount} / {totalCount} 投票済み
                </span>
              )}
            </div>

            {!room.isVotingOpen && stats && (
              <div className="mb-8 px-1 py-2 sm:mb-10 sm:px-2 sm:py-3">
                <p className="mb-5 text-sm font-bold text-[var(--foreground)]">集計</p>
                <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-10 sm:gap-y-4">
                  <p className="text-lg font-bold leading-tight text-[var(--foreground)] sm:text-xl">
                    平均:{" "}
                    <strong className="text-3xl font-bold tabular-nums tracking-tight text-[var(--foreground)] sm:text-4xl">
                      {stats.average}
                    </strong>
                  </p>
                  <p className="text-lg font-bold leading-tight text-[var(--foreground)] sm:text-xl">
                    最小:{" "}
                    <strong className="text-3xl font-bold tabular-nums tracking-tight text-[var(--foreground)] sm:text-4xl">
                      {stats.min}
                    </strong>
                  </p>
                  <p className="text-lg font-bold leading-tight text-[var(--foreground)] sm:text-xl">
                    最大:{" "}
                    <strong className="text-3xl font-bold tabular-nums tracking-tight text-[var(--foreground)] sm:text-4xl">
                      {stats.max}
                    </strong>
                  </p>
                </div>
              </div>
            )}

            {/* Point Cards */}
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
              {FIBONACCI_POINTS.map((point) => (
                <PointCard
                  key={point}
                  point={point}
                  isSelected={selectedPoint === point}
                  onClick={() => handleVote(point)}
                  disabled={!room.isVotingOpen}
                />
              ))}
            </div>

            {/* Host Controls */}
            {isHost && (
              <div className="flex flex-wrap gap-3 pt-[var(--section-title-margin)]">
                {room.isVotingOpen ? (
                  <button
                    onClick={handleReveal}
                    disabled={!allVoted}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    <Eye size={18} />
                    結果を表示
                  </button>
                ) : (
                  <>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <span className="text-sm font-semibold text-[var(--foreground)]">決定ポイント</span>
                      <select
                        value={finalPoint ?? ""}
                        onChange={(e) => setFinalPoint(Number(e.target.value) as FibonacciPoint)}
                        className="select-decision-point input-field max-w-[12rem] rounded-xl border-2 py-2"
                      >
                        <option value="">選択...</option>
                        {FIBONACCI_POINTS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleSaveResult}
                      disabled={finalPoint === null}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <CircleCheckBig size={18} />
                      保存して次へ
                    </button>
                  </>
                )}
                <button
                  onClick={handleReset}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RotateCcw size={18} />
                  リセット
                </button>
              </div>
            )}
          </section>
        )}

        {/* Waiting for Host - Participant Only */}
        {!isHost && !room.currentTask && (
          <section className="section card bg-[var(--background)] text-center py-12">
            <div className="text-[var(--muted-foreground)] space-y-3">
              <Users size={48} className="mx-auto opacity-50" />
              <p className="text-lg">ホストがタスクを設定するのを待っています...</p>
            </div>
          </section>
        )}

        {/* Vote History Section */}
        {voteHistory.length > 0 && (
          <VoteHistoryLog
            history={voteHistory}
            onDownloadCSV={handleDownloadCSV}
            onRetry={handleRetry}
            isHost={isHost}
          />
        )}
      </div>

      <footer className="mt-10 border-t border-[var(--lp-border)] pt-8 text-center sm:mt-12 sm:pt-10">
        <Link href="/" className="link-muted text-sm underline underline-offset-2">
          サイトTOPに戻る
        </Link>
      </footer>

      {isHost ? (
        <NotionRoomConnectModal
          open={notionModalOpen}
          onClose={() => setNotionModalOpen(false)}
          roomId={roomId}
          isPremium={premiumFlags.premium}
          notionOAuth={premiumFlags.notionOAuth}
          onRefreshPremium={() => void refreshPremium()}
          onApplyTask={(row) => {
            setTaskName(row.title);
            setFigmaUrl(row.url ?? "");
            setLinkedNotionPageId(row.pageId);
          }}
        />
      ) : null}
    </main>
  );
}
