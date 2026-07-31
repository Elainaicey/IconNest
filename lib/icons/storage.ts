import { DEFAULT_COLLECTIONS, SEED_LIBRARY } from "./catalog";
import type {
  IconItem,
  StorageDriver,
  ThemeMode,
  WorkspaceSnapshot,
} from "./types";

const DATABASE_NAME = "iconnest";
const DATABASE_VERSION = 1;
const STORE_NAME = "workspace";
const DATABASE_WORKSPACE_KEY = "current";
const WORKSPACE_KEY = "iconnest.workspace.v3";
const PREVIOUS_WORKSPACE_KEY = "iconnest.workspace.v2";
const LEGACY_LIBRARY_KEY = "iconnest.library.v1";
const LEGACY_COLLECTIONS_KEY = "iconnest.collections.v1";
const THEME_KEY = "iconnest.theme.v1";

const ICONIFY_ID_REPLACEMENTS: Record<string, string> = {
  "tabler:shapes": "tabler:geometry",
};

function migrateIconItem(icon: IconItem): IconItem {
  if (!icon.iconifyId) return icon;
  const replacement = ICONIFY_ID_REPLACEMENTS[icon.iconifyId];
  if (!replacement) return icon;

  return {
    ...icon,
    name: icon.id === "seed-shapes" ? "Geometry" : icon.name,
    iconifyId: replacement,
  };
}

function isIconItem(value: unknown): value is IconItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<IconItem>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.source === "string" &&
    Array.isArray(item.tags) &&
    typeof item.collection === "string" &&
    typeof item.favorite === "boolean" &&
    typeof item.addedAt === "number" &&
    (typeof item.svg === "string" || typeof item.iconifyId === "string")
  );
}

export function validateSnapshot(value: unknown): WorkspaceSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const snapshot = value as Partial<WorkspaceSnapshot>;
  if (!Array.isArray(snapshot.icons) || !Array.isArray(snapshot.collections)) {
    return null;
  }

  const icons = snapshot.icons.filter(isIconItem).map(migrateIconItem);
  const collections = snapshot.collections.filter(
    (item): item is string => typeof item === "string" && Boolean(item.trim()),
  );
  if (!icons.length) return null;

  return {
    version: 3,
    icons,
    collections: collections.length ? collections : [...DEFAULT_COLLECTIONS],
  };
}

function defaultWorkspace(): WorkspaceSnapshot {
  return {
    version: 3,
    icons: SEED_LIBRARY,
    collections: DEFAULT_COLLECTIONS,
  };
}

function parseSnapshot(value: string | null) {
  if (!value) return null;
  try {
    return validateSnapshot(JSON.parse(value));
  } catch {
    return null;
  }
}

function loadLegacyWorkspace(): WorkspaceSnapshot | null {
  const current = parseSnapshot(localStorage.getItem(WORKSPACE_KEY));
  if (current) return current;

  const previous = parseSnapshot(localStorage.getItem(PREVIOUS_WORKSPACE_KEY));
  if (previous) return previous;

  const legacyIcons = localStorage.getItem(LEGACY_LIBRARY_KEY);
  const legacyCollections = localStorage.getItem(LEGACY_COLLECTIONS_KEY);
  if (legacyIcons) {
    try {
      return validateSnapshot({
        icons: JSON.parse(legacyIcons),
        collections: legacyCollections
          ? JSON.parse(legacyCollections)
          : DEFAULT_COLLECTIONS,
      });
    } catch {
      return null;
    }
  }
  return null;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("无法打开本地数据库"));
    request.onblocked = () => reject(new Error("本地数据库升级被其他页面阻止"));
  });
}

async function readDatabase(): Promise<WorkspaceSnapshot | null> {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(DATABASE_WORKSPACE_KEY);
      request.onsuccess = () => resolve(validateSnapshot(request.result));
      request.onerror = () => reject(request.error ?? new Error("无法读取本地数据库"));
    });
  } finally {
    database.close();
  }
}

async function writeDatabase(snapshot: WorkspaceSnapshot): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(snapshot, DATABASE_WORKSPACE_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("无法保存本地数据库"));
      transaction.onabort = () => reject(transaction.error ?? new Error("本地数据库写入已中止"));
    });
  } finally {
    database.close();
  }
}

export type LoadedWorkspace = {
  snapshot: WorkspaceSnapshot;
  driver: StorageDriver;
  migrated: boolean;
};

export async function loadWorkspace(): Promise<LoadedWorkspace> {
  if (typeof indexedDB !== "undefined") {
    try {
      const stored = await readDatabase();
      if (stored) return { snapshot: stored, driver: "indexeddb", migrated: false };

      const legacy = loadLegacyWorkspace();
      const snapshot = legacy ?? defaultWorkspace();
      await writeDatabase(snapshot);
      return { snapshot, driver: "indexeddb", migrated: Boolean(legacy) };
    } catch {
      // Private browsing and strict browser policies can disable IndexedDB.
    }
  }

  return {
    snapshot: loadLegacyWorkspace() ?? defaultWorkspace(),
    driver: "localStorage",
    migrated: false,
  };
}

export async function saveWorkspace(
  snapshot: WorkspaceSnapshot,
  driver: StorageDriver,
) {
  if (driver === "indexeddb") {
    await writeDatabase(snapshot);
    return;
  }
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(snapshot));
}

export function workspaceSize(snapshot: WorkspaceSnapshot) {
  return new Blob([JSON.stringify(snapshot)]).size;
}

export function loadTheme(): ThemeMode {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

export function saveTheme(theme: ThemeMode) {
  localStorage.setItem(THEME_KEY, theme);
}
