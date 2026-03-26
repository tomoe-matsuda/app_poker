/**
 * GA4（gtag）が読み込まれている場合のみイベント送信。
 * コンバージョンは GA4 管理画面でイベント名をキーイベントに指定してください。
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const g = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof g !== "function") return;
  g("event", name, params ?? {});
}
