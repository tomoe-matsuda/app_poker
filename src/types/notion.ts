export type NotionDatabaseRow = {
  pageId: string;
  title: string;
  numberProperty?: string;
  numberValue: number | null;
  dateProperty?: string;
  dateValue: string | null;
};
