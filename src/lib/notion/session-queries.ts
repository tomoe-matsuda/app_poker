import "server-only";

import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export type NotionSessionListConfig = {
  /** Notion のタイトル列名（空なら先頭の title 列） */
  titleProperty?: string;
  /** URL 列名（空なら最初の url 型プロパティ） */
  urlProperty?: string;
  /** ストーリーポイント列（一覧で現在値を読む用） */
  pointsProperty: string;
};

export type NotionTaskRowPayload = {
  pageId: string;
  title: string;
  url: string | null;
  points: number | null;
};

function asPageRow(item: unknown): PageObjectResponse | null {
  if (typeof item !== "object" || item === null) return null;
  const o = item as { object?: string; properties?: unknown };
  if (o.object !== "page" || !o.properties || typeof o.properties !== "object") return null;
  return item as PageObjectResponse;
}

function plainTitleFromProperty(prop: PageObjectResponse["properties"][string]): string {
  if (prop.type !== "title") return "";
  return prop.title.map((t) => t.plain_text).join("") || "(無題)";
}

function pageTitle(page: PageObjectResponse, preferredName?: string): string {
  const props = page.properties;
  if (preferredName) {
    const preferred = props[preferredName];
    if (preferred?.type === "title") return plainTitleFromProperty(preferred);
  }
  for (const p of Object.values(props)) {
    if (p.type === "title") return plainTitleFromProperty(p);
  }
  return "(無題)";
}

function readUrl(
  props: PageObjectResponse["properties"],
  name?: string
): string | null {
  if (name) {
    const p = props[name];
    if (p?.type === "url" && p.url) return p.url;
  }
  for (const p of Object.values(props)) {
    if (p.type === "url" && p.url) return p.url;
  }
  return null;
}

function readNumber(props: PageObjectResponse["properties"], name: string): number | null {
  const p = props[name];
  if (!p || p.type !== "number") return null;
  return p.number;
}

/**
 * ユーザーのインテグレーションシークレットで DB 内のタスク行を取得する（サーバーのみ）。
 */
export async function listNotionTasksWithToken(
  token: string,
  databaseId: string,
  cfg: NotionSessionListConfig
): Promise<NotionTaskRowPayload[]> {
  const notion = new Client({ auth: token });
  const db = await notion.databases.retrieve({ database_id: databaseId.trim() });
  if (!("data_sources" in db) || !db.data_sources?.length) {
    throw new Error("データベースに data source が見つかりません。DATABASE_ID を確認してください。");
  }

  const dataSourceId = db.data_sources[0]!.id;
  const rows: NotionTaskRowPayload[] = [];
  let cursor: string | undefined;

  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
    });
    for (const item of res.results) {
      const page = asPageRow(item);
      if (!page) continue;
      rows.push({
        pageId: page.id,
        title: pageTitle(page, cfg.titleProperty?.trim() || undefined),
        url: readUrl(page.properties, cfg.urlProperty?.trim() || undefined),
        points: readNumber(page.properties, cfg.pointsProperty),
      });
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return rows;
}

export async function updateNotionPointsWithToken(
  token: string,
  pageId: string,
  pointsProperty: string,
  value: number
): Promise<void> {
  const notion = new Client({ auth: token });
  const prop = pointsProperty.trim();
  if (!prop) throw new Error("ポイント列名が空です。");

  await notion.pages.update({
    page_id: pageId,
    properties: {
      [prop]: { number: value },
    } as Parameters<Client["pages"]["update"]>[0]["properties"],
  });
}
