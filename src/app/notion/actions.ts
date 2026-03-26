"use server";

import { revalidatePath } from "next/cache";
import { updatePageProperties, type NotionPropertyUpdate } from "@/lib/notion/server";

export async function updateNotionDatabaseRowAction(
  pageId: string,
  updates: NotionPropertyUpdate
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    await updatePageProperties(pageId, updates);
    revalidatePath("/notion");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Notion の更新に失敗しました。";
    return { ok: false, message };
  }
}
