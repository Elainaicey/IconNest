import { DEFAULT_COLLECTIONS, SEED_LIBRARY } from "./catalog";
import type { IconItem, ThemeMode, WorkspaceSnapshot } from "./types";

const WORKSPACE_KEY = "iconnest.workspace.v2";
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
    version: 2,
    icons,
    collections: collections.length ? collections : [...DEFAULT_COLLECTIONS],
  };
}

export function loadWorkspace(): WorkspaceSnapshot {
  const saved = localStorage.getItem(WORKSPACE_KEY);
  if (saved) {
    const snapshot = validateSnapshot(JSON.parse(saved));
    if (snapshot) return snapshot;
  }

  const legacyIcons = localStorage.getItem(LEGACY_LIBRARY_KEY);
  const legacyCollections = localStorage.getItem(LEGACY_COLLECTIONS_KEY);
  if (legacyIcons) {
    const snapshot = validateSnapshot({
      icons: JSON.parse(legacyIcons),
      collections: legacyCollections
        ? JSON.parse(legacyCollections)
        : DEFAULT_COLLECTIONS,
    });
    if (snapshot) return snapshot;
  }

  return {
    version: 2,
    icons: SEED_LIBRARY,
    collections: DEFAULT_COLLECTIONS,
  };
}

export function saveWorkspace(snapshot: WorkspaceSnapshot) {
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(snapshot));
}

export function loadTheme(): ThemeMode {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

export function saveTheme(theme: ThemeMode) {
  localStorage.setItem(THEME_KEY, theme);
}
