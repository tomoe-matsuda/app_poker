/** 本番 URL（末尾スラッシュなし）。OGP・sitemap・canonical 用 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  return "https://storypoint-poker.vercel.app";
}
