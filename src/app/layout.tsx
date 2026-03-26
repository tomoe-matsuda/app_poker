import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { getSiteUrl } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/**
 * GA4 の測定 ID（G-）。Vercel ではどちらか一方が入っていればタグを出す。
 * キーイベント例: room_create, start_enter_room, room_join, vote_result_saved, csv_download
 *（GA4 管理画面でコンバージョン／キーイベントに登録）
 */
const gaId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Design Story Point — プランニングポーカー",
    template: "%s | Design Story Point",
  },
  description:
    "デザイン・開発チーム向けのオンラインプランニングポーカー。ルームを共有し、タスクのストーリーポイントを揃えて合意形成します。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "Design Story Point",
    title: "Design Story Point — プランニングポーカー",
    description:
      "チームでタスク見積もりを揃える。招待リンクで参加し、フィボナッチでストーリーポイントを決められます。",
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Story Point",
    description: "チームでタスク見積もりを揃えるプランニングポーカー。",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        {gaId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
