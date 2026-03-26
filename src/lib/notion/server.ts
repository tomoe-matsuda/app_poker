import "server-only";

import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { NotionDatabaseRow } from "@/types/notion";

export type { NotionDatabaseRow };

function getClient(): Client {
  const auth = process.env.NOTION_API_KEY;
  if (!auth) {
    throw new Error("NOTION_API_KEY が設定されていません。");
  }
  return new Client({ auth });
}

export function getNotionDatabaseId(): string {
  const id = process.env.NOTION_DATABASE_ID?.trim();
  if (!id) {
    throw new Error("NOTION_DATABASE_ID が設定されていません。");
  }
  return id;
}

export function getTitlePropertyName(): string {
  return process.env.NOTION_TITLE_PROPERTY?.trim() || "Name";
}

export function getEditableNumberPropertyName(): string | undefined {
  const n = process.env.NOTION_EDITABLE_NUMBER_PROP?.trim();
  return n || undefined;
}

export function getEditableDatePropertyName(): string | undefined {
  const n = process.env.NOTION_EDITABLE_DATE_PROP?.trim();
  return n || undefined;
}

/** dataSources.query の results からページ行だけを取り出す */
function asPageRow(
  item: unknown
): PageObjectResponse | null {
  if (typeof item !== "object" || item === null) return null;
  const o = item as { object?: string; properties?: unknown };
  if (o.object !== "page" || !o.properties || typeof o.properties !== "object") return null;
  return item as PageObjectResponse;
}

function plainTitleFromProperty(prop: PageObjectResponse["properties"][string]): string {
  if (prop.type !== "title") return "";
  return prop.title.map((t) => t.plain_text).join("") || "(無題)";
}

/** データベース先頭の title 型プロパティからタイトル文字列を得る */
function pageTitle(page: PageObjectResponse, preferredName: string): string {
  const props = page.properties;
  const preferred = props[preferredName];
  if (preferred?.type === "title") {
    return plainTitleFromProperty(preferred);
  }
  for (const p of Object.values(props)) {
    if (p.type === "title") return plainTitleFromProperty(p);
  }
  return "(無題)";
}

function readNumber(
  props: PageObjectResponse["properties"],
  name: string | undefined
): number | null {
  if (!name) return null;
  const p = props[name];
  if (!p || p.type !== "number") return null;
  return p.number;
}

function readDate(props: PageObjectResponse["properties"], name: string | undefined): string | null {
  if (!name) return null;
  const p = props[name];
  if (!p || p.type !== "date") return null;
  return p.date?.start ?? null;
}

/**
 * 指定 DATABASE_ID の全ページをページネーションで取得し、アプリ表示用に整形する。
 * （Notion API 2025 以降: DB に紐づく data source を query する）
 */
export async function queryDatabaseRowsForApp(): Promise<NotionDatabaseRow[]> {
  const notion = getClient();
  const databaseId = getNotionDatabaseId();
  const titleProp = getTitlePropertyName();
  const numProp = getEditableNumberPropertyName();
  const dateProp = getEditableDatePropertyName();

  const db = await notion.databases.retrieve({ database_id: databaseId });
  if (!("data_sources" in db) || !db.data_sources?.length) {
    throw new Error(
      "データベースに data source が含まれていません。Notion 上でデータベースが正しく取得できるか、DATABASE_ID を確認してください。"
    );
  }

  const dataSourceId = db.data_sources[0]!.id;
  const rows: NotionDatabaseRow[] = [];
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
        title: pageTitle(page, titleProp),
        numberProperty: numProp,
        numberValue: numProp ? readNumber(page.properties, numProp) : null,
        dateProperty: dateProp,
        dateValue: dateProp ? readDate(page.properties, dateProp) : null,
      });
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return rows;
}

export type NotionPropertyUpdate = {
  number?: number | null;
  date?: string | null;
};

/**
 * ページ ID を指定し、環境変数で定義した数値・日付プロパティを更新する。
 */
export async function updatePageProperties(
  pageId: string,
  updates: NotionPropertyUpdate
): Promise<void> {
  const notion = getClient();
  const numProp = getEditableNumberPropertyName();
  const dateProp = getEditableDatePropertyName();

  const properties: Record<string, unknown> = {};

  if (updates.number !== undefined && numProp) {
    properties[numProp] = { number: updates.number };
  }

  if (updates.date !== undefined && dateProp) {
    if (updates.date === null || updates.date === "") {
      properties[dateProp] = { date: null };
    } else {
      const start = updates.date.slice(0, 10);
      properties[dateProp] = { date: { start } };
    }
  }

  if (Object.keys(properties).length === 0) {
    throw new Error(
      "更新対象のプロパティがありません。NOTION_EDITABLE_NUMBER_PROP または NOTION_EDITABLE_DATE_PROP を設定してください。"
    );
  }

  await notion.pages.update({
    page_id: pageId,
    properties: properties as Parameters<Client["pages"]["update"]>[0]["properties"],
  });
}
