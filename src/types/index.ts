import { Timestamp } from "firebase/firestore";

export interface Room {
  id: string;
  name: string;
  createdAt: Timestamp;
  createdBy: string;
  currentTask: Task | null;
  participants: Participant[];
  isVotingOpen: boolean;
  maxParticipants: number;
}

export interface Task {
  id: string;
  name: string;
  figmaUrl?: string;
  description?: string;
}

export interface Participant {
  id: string;
  name: string;
  vote: number | null;
  joinedAt: Timestamp;
  isHost: boolean;
}

export interface VoteHistory {
  id: string;
  roomId: string;
  taskName: string;
  figmaUrl?: string;
  finalPoint: number;
  votes: VoteRecord[];
  decidedAt: Timestamp;
  decidedBy: string;
}

export interface VoteRecord {
  participantId: string;
  participantName: string;
  vote: number;
}

export const FIBONACCI_POINTS = [1, 2, 3, 5, 8, 13, 21] as const;
export type FibonacciPoint = (typeof FIBONACCI_POINTS)[number];
