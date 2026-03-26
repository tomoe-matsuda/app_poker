import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ルーム作成・参加",
  description: "プランニングポーカーのルームを発行するか、共有されたリンクから参加します。",
  openGraph: {
    title: "ルーム作成・参加 | Design Story Point",
    description: "ルームを発行してチームを招待、またはルーム URL から参加します。",
  },
};

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
