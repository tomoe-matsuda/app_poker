"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function isSafeRoomReturn(path: string | null): path is string {
  if (!path || path.length > 256) return false;
  if (!path.startsWith("/room/")) return false;
  if (path.includes("//") || path.includes("?") || path.includes("#")) return false;
  const rest = path.slice("/room/".length);
  return /^[a-zA-Z0-9_-]+$/.test(rest);
}

export type RoomReturnLinkProps = {
  className: string;
  /** router.back() 時にテキストリンク風の見た目にする（button のデフォルト枠を消す） */
  asTextButton?: boolean;
};

export function RoomReturnLink({ className, asTextButton }: RoomReturnLinkProps) {
  const sp = useSearchParams();
  const router = useRouter();
  const raw = sp.get("return");
  const roomHref = isSafeRoomReturn(raw) ? raw : null;

  if (roomHref) {
    return (
      <Link href={roomHref} className={className}>
        ルームに戻る
      </Link>
    );
  }

  const btnClass = asTextButton
    ? `${className} inline cursor-pointer border-0 bg-transparent p-0 font-inherit underline`
    : className;

  return (
    <button type="button" onClick={() => router.back()} className={btnClass}>
      ルームに戻る
    </button>
  );
}
