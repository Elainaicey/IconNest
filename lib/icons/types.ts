export type WorkspaceRoute =
  | { kind: "library" }
  | { kind: "explore" }
  | { kind: "favorites" }
  | { kind: "recent" }
  | { kind: "trash" }
  | { kind: "collection"; collection: string };

export type ViewMode = "grid" | "list";
export type SortMode = "newest" | "name" | "source";
export type ThemeMode = "light" | "dark";
export type StorageDriver = "indexeddb" | "localStorage";
export type StorageState = "loading" | "saving" | "saved" | "error";

export type IconItem = {
  id: string;
  name: string;
  iconifyId?: string;
  svg?: string;
  source: string;
  tags: string[];
  collection: string;
  favorite: boolean;
  addedAt: number;
  viewedAt?: number;
  trashed?: boolean;
};

export type WorkspaceSnapshot = {
  version: 1;
  icons: IconItem[];
  collections: string[];
};

export type IconifySearchResponse = {
  icons: string[];
  total: number;
  limit: number;
  start: number;
};

export type SourceDefinition = {
  label: string;
  prefix: string;
  description: string;
  tone: "iris" | "ruby" | "sky" | "teal" | "amber" | "jade";
};
