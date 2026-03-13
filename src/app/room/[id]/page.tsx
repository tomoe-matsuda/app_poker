"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, ExternalLink, RotateCcw, Eye, CircleCheckBig, Users, Crown } from "lucide-react";
import { PointCard } from "@/components/PointCard";
import { VoteHistoryLog } from "@/components/VoteHistoryLog";
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
    const roomUrl = `${window.location.origin}/room/${roomId}`;
    await navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartVoting = async () => {
    if (!taskName.trim()) return;
    await updateTask(roomId, taskName.trim(), figmaUrl.trim() || undefined);
    setFinalPoint(null);
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
  };

  const handleDownloadCSV = () => {
    const date = new Date().toISOString().split("T")[0];
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
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">読み込み中...</div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-gray-500">ルームが見つかりません</div>
        <button onClick={() => router.push("/")} className="btn-primary">
          トップに戻る
        </button>
      </main>
    );
  }

  if (!hasJoined) {
    const isFull = room.participants.length >= room.maxParticipants;
    const hasHost = room.participants.some((p) => p.isHost);

    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Design Story Point
            </h1>
            <p className="text-gray-500">
              ルームに参加するには名前を入力してください
            </p>
          </div>

          <div className="card-shadow rounded-3xl p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between text-sm text-gray-500">
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
      </main>
    );
  }

  const stats = !room.isVotingOpen ? calculateStats() : null;
  const votedCount = room.participants.filter((p) => p.vote !== null).length;
  const totalCount = room.participants.length;
  const allVoted = totalCount > 0 && votedCount === totalCount;

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="max-w-4xl mx-auto page-sections">
        {/* Header */}
        <header className="section flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="heading-lg">Design Story Point</h1>
              {isHost && (
                <span className="badge">
                  <Crown size={12} />
                  ホスト: {myName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm text-[var(--muted-foreground)]">Room: {roomId}</span>
              <button
                onClick={handleCopyRoomUrl}
                className="flex items-center gap-1 link-muted transition-colors"
                title="参加者用URLをコピー"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
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
            <div className="section-content">
              <input
                type="text"
                placeholder="タスク名を入力"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="input-field w-full"
              />
              <div className="flex gap-3">
                <input
                  type="url"
                  placeholder="GitHub or Figma URL（任意）"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  className="input-field flex-1"
                />
                {figmaUrl && (
                  <a
                    href={figmaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center gap-2"
                  >
                    <ExternalLink size={18} />
                    開く
                  </a>
                )}
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
            <div className="card-shadow rounded-2xl p-4 bg-[var(--muted)] mb-[var(--section-title-margin)]">
              <p className="text-label mb-1">現在のタスク</p>
              <p className="heading-sm truncate">{room.currentTask.name}</p>
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
            <div className="flex items-center justify-between mb-[var(--section-title-margin)]">
              <div className="flex items-center gap-3">
                <h2 className="section-title mb-0">
                  {room.isVotingOpen ? "ポイントを選択" : "投票結果"}
                </h2>
                {room.isVotingOpen && (
                  <span className="badge-outline">
                    {votedCount} / {totalCount} 投票済み
                  </span>
                )}
              </div>
              {!room.isVotingOpen && stats && (
                <div className="flex items-center gap-4 text-caption">
                  <span>平均: <strong className="text-[var(--foreground)]">{stats.average}</strong></span>
                  <span>最小: <strong className="text-[var(--foreground)]">{stats.min}</strong></span>
                  <span>最大: <strong className="text-[var(--foreground)]">{stats.max}</strong></span>
                </div>
              )}
            </div>

            {/* Point Cards */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
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
                    <div className="flex items-center gap-3">
                      <span className="text-caption">決定ポイント:</span>
                      <select
                        value={finalPoint ?? ""}
                        onChange={(e) => setFinalPoint(Number(e.target.value) as FibonacciPoint)}
                        className="input-field py-2 border-[var(--foreground)] border-2"
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
    </main>
  );
}
