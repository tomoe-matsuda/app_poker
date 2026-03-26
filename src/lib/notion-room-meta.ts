/** ルームごとに OAuth/安全連携用の DB・列設定だけ sessionStorage に保持（トークンは含めない） */

export type NotionRoomMeta = {
  databaseId: string;
  titleProperty: string;
  urlProperty: string;
  pointsProperty: string;
};

const key = (roomId: string) => `notion_room_meta_${roomId}`;

export function saveNotionRoomMeta(roomId: string, meta: NotionRoomMeta): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key(roomId), JSON.stringify(meta));
}

export function loadNotionRoomMeta(roomId: string): NotionRoomMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key(roomId));
    if (!raw) return null;
    const p = JSON.parse(raw) as NotionRoomMeta;
    if (p?.databaseId && p?.pointsProperty) return p;
  } catch {
    /* ignore */
  }
  return null;
}

export function clearNotionRoomMeta(roomId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(key(roomId));
}
