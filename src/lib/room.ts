import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  Timestamp,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Room, Participant, VoteHistory, VoteRecord } from "@/types";

function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateParticipantId(): string {
  return `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function createRoom(maxParticipants: number): Promise<string> {
  const roomId = generateRoomId();

  const roomData: Omit<Room, "id"> = {
    name: `ルーム ${roomId}`,
    createdAt: Timestamp.now(),
    createdBy: "",
    currentTask: null,
    participants: [],
    isVotingOpen: false,
    maxParticipants,
  };

  await setDoc(doc(db, "rooms", roomId), roomData);

  return roomId;
}

export async function checkRoomAndJoin(
  roomId: string,
  userName: string,
  isHost: boolean = false
): Promise<{ success: boolean; error?: string }> {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    return { success: false, error: "ルームが見つかりません" };
  }

  const roomData = roomSnap.data() as Omit<Room, "id">;

  const existingParticipantId =
    typeof window !== "undefined"
      ? localStorage.getItem(`room_${roomId}_participantId`)
      : null;

  if (existingParticipantId) {
    const existingParticipant = roomData.participants.find(
      (p) => p.id === existingParticipantId
    );
    if (existingParticipant) {
      return { success: true };
    }
  }

  if (roomData.participants.length >= roomData.maxParticipants) {
    return { success: false, error: "ルームの参加人数が上限に達しています" };
  }

  const participantId = generateParticipantId();

  const participant: Participant = {
    id: participantId,
    name: userName,
    vote: null,
    joinedAt: Timestamp.now(),
    isHost,
  };

  const updateData: Record<string, unknown> = {
    participants: arrayUnion(participant),
  };

  if (isHost) {
    updateData.createdBy = participantId;
  }

  await updateDoc(roomRef, updateData);

  if (typeof window !== "undefined") {
    localStorage.setItem(`room_${roomId}_participantId`, participantId);
    localStorage.setItem(`room_${roomId}_participantName`, userName);
  }

  return { success: true };
}

export async function checkRoomExists(roomId: string): Promise<boolean> {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);
  return roomSnap.exists();
}

export function subscribeToRoom(
  roomId: string,
  callback: (room: Room | null) => void
): () => void {
  const roomRef = doc(db, "rooms", roomId);

  return onSnapshot(
    roomRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as Room);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Room subscription error:", error);
      callback(null);
    }
  );
}

export async function updateTask(
  roomId: string,
  taskName: string,
  figmaUrl?: string
): Promise<void> {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, {
    currentTask: {
      id: `task_${Date.now()}`,
      name: taskName,
      figmaUrl: figmaUrl || null,
    },
    isVotingOpen: true,
  });
}

export async function submitVote(
  roomId: string,
  participantId: string,
  vote: number
): Promise<void> {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) return;

  const roomData = roomSnap.data() as Omit<Room, "id">;
  const updatedParticipants = roomData.participants.map((p) =>
    p.id === participantId ? { ...p, vote } : p
  );

  await updateDoc(roomRef, {
    participants: updatedParticipants,
  });
}

export async function resetVotes(roomId: string): Promise<void> {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) return;

  const roomData = roomSnap.data() as Omit<Room, "id">;
  const updatedParticipants = roomData.participants.map((p) => ({
    ...p,
    vote: null,
  }));

  await updateDoc(roomRef, {
    participants: updatedParticipants,
    isVotingOpen: true,
  });
}

export async function revealVotes(roomId: string): Promise<void> {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, {
    isVotingOpen: false,
  });
}

export async function saveVoteHistory(
  roomId: string,
  taskName: string,
  figmaUrl: string | undefined,
  finalPoint: number,
  participants: Participant[],
  decidedBy: string
): Promise<void> {
  const votes: VoteRecord[] = participants
    .filter((p) => p.vote !== null)
    .map((p) => ({
      participantId: p.id,
      participantName: p.name,
      vote: p.vote!,
    }));

  const historyData: Omit<VoteHistory, "id"> = {
    roomId,
    taskName,
    figmaUrl,
    finalPoint,
    votes,
    decidedAt: Timestamp.now(),
    decidedBy,
  };

  await addDoc(collection(db, "voteHistory"), historyData);
}

export async function clearCurrentTask(roomId: string): Promise<void> {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, {
    currentTask: null,
    isVotingOpen: false,
  });
}

export function getLocalParticipantId(roomId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`room_${roomId}_participantId`);
}

export function getLocalParticipantName(roomId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`room_${roomId}_participantName`);
}

export function extractRoomIdFromUrl(input: string): string {
  const trimmed = input.trim();
  
  const urlMatch = trimmed.match(/\/room\/([A-Z0-9]{6})(?:\/|$|\?)/i);
  if (urlMatch) {
    return urlMatch[1].toUpperCase();
  }
  
  const idMatch = trimmed.match(/^[A-Z0-9]{6}$/i);
  if (idMatch) {
    return trimmed.toUpperCase();
  }
  
  return trimmed.toUpperCase();
}

export function subscribeToVoteHistory(
  roomId: string,
  callback: (history: VoteHistory[]) => void
): () => void {
  const q = query(
    collection(db, "voteHistory"),
    where("roomId", "==", roomId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const history: VoteHistory[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VoteHistory[];
      history.sort((a, b) => a.decidedAt.toMillis() - b.decidedAt.toMillis());
      callback(history);
    },
    (error) => {
      console.error("Vote history subscription error:", error);
      callback([]);
    }
  );
}

export async function getVoteHistory(roomId: string): Promise<VoteHistory[]> {
  const q = query(
    collection(db, "voteHistory"),
    where("roomId", "==", roomId)
  );

  const snapshot = await getDocs(q);
  const history = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as VoteHistory[];
  
  history.sort((a, b) => a.decidedAt.toMillis() - b.decidedAt.toMillis());
  return history;
}

export function generateCSV(history: VoteHistory[]): string {
  const headers = ["タスク名", "Figma URL", "決定ポイント"];
  const rows = history.map((h) => [
    `"${h.taskName.replace(/"/g, '""')}"`,
    h.figmaUrl ? `"${h.figmaUrl.replace(/"/g, '""')}"` : "",
    h.finalPoint.toString(),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function downloadCSV(history: VoteHistory[], filename: string): void {
  if (history.length === 0) {
    console.warn("No history to download");
    return;
  }

  const csv = generateCSV(history);
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
}

export async function retryTask(
  roomId: string,
  taskName: string,
  figmaUrl?: string
): Promise<void> {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) return;

  const roomData = roomSnap.data() as Omit<Room, "id">;
  const updatedParticipants = roomData.participants.map((p) => ({
    ...p,
    vote: null,
  }));

  await updateDoc(roomRef, {
    currentTask: {
      id: `task_${Date.now()}`,
      name: taskName,
      figmaUrl: figmaUrl || null,
    },
    participants: updatedParticipants,
    isVotingOpen: true,
  });
}

export async function deleteVoteHistory(historyId: string): Promise<void> {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "voteHistory", historyId));
}
