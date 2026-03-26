import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ルーム",
  description: "プランニングポーカーのルーム。タスクの投票とストーリーポイントの記録が行えます。",
  robots: { index: false, follow: false },
};

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
