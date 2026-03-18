"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Users, Plus, Copy, Check, Link } from "lucide-react";
import { createRoom, checkRoomExists, extractRoomIdFromUrl, checkRoomAndJoin } from "@/lib/room";

type Mode = "initial" | "host" | "participant";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("initial");
  const [participantCount, setParticipantCount] = useState<string>("4");
  const [isCreating, setIsCreating] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [createdRoomUrl, setCreatedRoomUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [roomUrlInput, setRoomUrlInput] = useState("");
  const [userName, setUserName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const joinParam = params.get("join");
    if (!joinParam) return;

    const normalizedJoinValue = joinParam.trim();
    if (!normalizedJoinValue) return;

    const roomId = extractRoomIdFromUrl(normalizedJoinValue);
    if (!roomId) return;

    const roomUrl = typeof window !== "undefined"
      ? `${window.location.origin}/room/${roomId}`
      : normalizedJoinValue;

    setMode("participant");
    setRoomUrlInput(roomUrl);
    setError("");
  }, []);

  const handleCreateRoom = async () => {
    const count = parseInt(participantCount, 10);
    if (isNaN(count) || count < 1 || count > 20) {
      setError("参加人数は1〜20人で設定してください");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const newRoomId = await createRoom(count);
      const roomUrl = `${window.location.origin}/room/${newRoomId}`;
      setCreatedRoomId(newRoomId);
      setCreatedRoomUrl(roomUrl);
    } catch (err) {
      setError("ルームの作成に失敗しました");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!createdRoomUrl) return;
    const inviteUrl = `${window.location.origin}/?join=${encodeURIComponent(createdRoomUrl)}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterRoomAsHost = async () => {
    if (!userName.trim()) {
      setError("名前を入力してください");
      return;
    }
    if (!createdRoomId) return;

    setIsJoining(true);
    setError("");

    try {
      const result = await checkRoomAndJoin(createdRoomId, userName.trim(), true);
      if (result.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`room_${createdRoomId}_isHost`, "true");
        }
        router.push(`/room/${createdRoomId}`);
      } else {
        setError(result.error || "ルームへの参加に失敗しました");
      }
    } catch (err) {
      setError("ルームへの参加に失敗しました");
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinRoomAsParticipant = async () => {
    if (!userName.trim()) {
      setError("名前を入力してください");
      return;
    }
    if (!roomUrlInput.trim()) {
      setError("ルームURLまたはIDを入力してください");
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      const roomId = extractRoomIdFromUrl(roomUrlInput);
      const exists = await checkRoomExists(roomId);

      if (!exists) {
        setError("ルームが見つかりません");
        return;
      }

      const result = await checkRoomAndJoin(roomId, userName.trim(), false);
      if (result.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`room_${roomId}_isHost`, "false");
        }
        router.push(`/room/${roomId}`);
      } else {
        setError(result.error || "ルームへの参加に失敗しました");
      }
    } catch (err) {
      setError("ルームへの参加に失敗しました");
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  const resetToInitial = () => {
    setMode("initial");
    setCreatedRoomId(null);
    setCreatedRoomUrl(null);
    setUserName("");
    setRoomUrlInput("");
    setError("");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">
            Design Story Point
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            デザイナーのための
            <br />
            プランニングポーカー
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {mode === "initial" && (
          <div className="space-y-4">
            <button
              onClick={() => setMode("host")}
              className="btn-primary w-full flex items-center justify-center gap-3"
            >
              <Crown size={20} />
              ホストとして参加
            </button>
            <button
              onClick={() => setMode("participant")}
              className="btn-secondary w-full flex items-center justify-center gap-3"
            >
              <Users size={20} />
              参加者として参加
            </button>
          </div>
        )}

        {mode === "host" && (
          <div className="space-y-6">
            {!createdRoomUrl ? (
              <div className="card-shadow rounded-3xl p-6 bg-[var(--background)]">
                <div className="section-content">
                  <div className="space-y-2">
                    <label className="text-label">
                      参加人数
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={participantCount}
                        onChange={(e) => setParticipantCount(e.target.value)}
                        className="input-field w-24 text-center"
                        placeholder="4"
                      />
                      <span className="text-[var(--muted-foreground)]">人</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateRoom}
                    disabled={isCreating}
                    className="btn-primary w-full flex items-center justify-center gap-3"
                  >
                    <Plus size={20} strokeWidth={2.5} />
                    {isCreating ? "作成中..." : "新しいルームを作成"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-shadow rounded-3xl p-6 bg-[var(--background)]">
                <div className="section-content">
                  <div className="space-y-3">
                    <p className="text-label">
                      ルームが作成されました
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={createdRoomUrl}
                        readOnly
                        className="input-field flex-1 text-sm bg-[var(--muted)]"
                      />
                      <button
                        onClick={handleCopyUrl}
                        className="btn-secondary p-3"
                        title="URLをコピー"
                      >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-label">
                      あなたの名前
                    </label>
                    <input
                      type="text"
                      placeholder="名前を入力"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEnterRoomAsHost()}
                      className="input-field w-full"
                    />
                  </div>

                  <button
                    onClick={handleEnterRoomAsHost}
                    disabled={isJoining}
                    className="btn-primary w-full"
                  >
                    {isJoining ? "参加中..." : "ルームに入る"}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={resetToInitial}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] w-full text-center"
            >
              ← 戻る
            </button>
          </div>
        )}

        {mode === "participant" && (
          <div className="space-y-6">
            <div className="card-shadow rounded-3xl p-6 bg-[var(--background)]">
              <div className="section-content">
                <div className="space-y-2">
                  <label className="text-label flex items-center gap-2">
                    <Link size={16} />
                    ルームURLをペースト
                  </label>
                  <input
                    type="text"
                    placeholder="https://... または ルームID"
                    value={roomUrlInput}
                    onChange={(e) => setRoomUrlInput(e.target.value)}
                    className="input-field w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-label">
                    あなたの名前
                  </label>
                  <input
                    type="text"
                    placeholder="名前を入力"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleJoinRoomAsParticipant()}
                    className="input-field w-full"
                  />
                </div>

                <button
                  onClick={handleJoinRoomAsParticipant}
                  disabled={isJoining}
                  className="btn-primary w-full"
                >
                  {isJoining ? "参加中..." : "ルームに参加"}
                </button>
              </div>
            </div>

            <button
              onClick={resetToInitial}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] w-full text-center"
            >
              ← 戻る
            </button>
          </div>
        )}

        <p className="text-center text-caption">
          フィボナッチ数列でデザインタスクを見積もろう
        </p>
      </div>
    </main>
  );
}
