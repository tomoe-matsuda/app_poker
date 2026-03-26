import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import { LpHomeClient } from "./lp-home-client";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "プランニングポーカーでタスク見積もりを揃える",
  description:
    "Design Story Point は、デザイン・開発チーム向けのオンラインプランニングポーカーです。招待リンクでルームに集まり、フィボナッチでストーリーポイントを合意形成できます。",
  openGraph: {
    url: siteUrl,
    title: "Design Story Point — プランニングポーカー",
    description:
      "チームでタスク見積もりを揃える。ルーム共有・投票・履歴の CSV / Notion 連携に対応。",
  },
};

export default function Home() {
  return <LpHomeClient />;
}
