"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type ChangeEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fetchIconSvg } from "@/lib/icons/api";
import { DEFAULT_COLLECTIONS, SEED_LIBRARY } from "@/lib/icons/catalog";
import { downloadIconPng, exportIconsZip } from "@/lib/icons/export";
import { workspacePaths } from "@/lib/icons/paths";
import {
  loadTheme,
  loadWorkspace,
  saveTheme,
  saveWorkspace,
  validateSnapshot,
  workspaceSize,
} from "@/lib/icons/storage";
import {
  createReactIconSnippet,
  downloadBlob,
  sanitizeSvg,
  svgDataUrl,
} from "@/lib/icons/svg";
import type {
  IconItem,
  SortMode,
  StorageDriver,
  StorageState,
  ThemeMode,
  ViewMode,
} from "@/lib/icons/types";

type LibraryContextValue = {
  icons: IconItem[];
  collections: string[];
  hydrated: boolean;
  storageDriver: StorageDriver;
  storageState: StorageState;
  workspaceBytes: number;
  lastSavedAt: number | null;
  theme: ThemeMode;
  query: string;
  viewMode: ViewMode;
  sortMode: SortMode;
  filterSource: string;
  selectedIds: string[];
  selectedIcon: IconItem | null;
  toast: string;
  mobileMenuOpen: boolean;
  createCollectionOpen: boolean;
  collectionManagerOpen: boolean;
  commandMenuOpen: boolean;
  sidebarCollapsed: boolean;
  uploadInputRef: RefObject<HTMLInputElement | null>;
  backupInputRef: RefObject<HTMLInputElement | null>;
  stats: {
    total: number;
    favorites: number;
    uploads: number;
    sources: number;
    trash: number;
  };
  setQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortMode: (mode: SortMode) => void;
  setFilterSource: (source: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCreateCollectionOpen: (open: boolean) => void;
  setCollectionManagerOpen: (open: boolean) => void;
  setCommandMenuOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSelectedIconId: (id: string | null) => void;
  notify: (message: string) => void;
  updateIcon: (id: string, patch: Partial<IconItem>) => void;
  addIcon: (icon: IconItem) => void;
  openIcon: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  toggleSelectAll: (ids: string[]) => void;
  bulkFavorite: () => void;
  bulkMove: (collection: string) => void;
  bulkTrash: () => void;
  restoreIcon: (id: string) => void;
  deleteIcon: (id: string) => void;
  createCollection: (name: string) => boolean;
  renameCollection: (currentName: string, nextName: string) => boolean;
  deleteCollection: (name: string) => boolean;
  pasteSvg: () => Promise<void>;
  importSvgFiles: (files: File[]) => Promise<void>;
  handleUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleBackupImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  exportWorkspace: () => void;
  exportSelected: () => void;
  copySvg: (icon: IconItem) => Promise<void>;
  copyReact: (icon: IconItem) => Promise<void>;
  copyHtml: (icon: IconItem) => Promise<void>;
  copyCss: (icon: IconItem) => Promise<void>;
  downloadSvg: (icon: IconItem) => Promise<void>;
  downloadPng: (icon: IconItem, size?: number) => Promise<void>;
  toggleTheme: () => void;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [icons, setIcons] = useState<IconItem[]>(SEED_LIBRARY);
  const [collections, setCollections] =
    useState<string[]>(DEFAULT_COLLECTIONS);
  const [hydrated, setHydrated] = useState(false);
  const [storageDriver, setStorageDriver] =
    useState<StorageDriver>("indexeddb");
  const [storageState, setStorageState] =
    useState<StorageState>("loading");
  const [workspaceBytes, setWorkspaceBytes] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [filterSource, setFilterSource] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [collectionManagerOpen, setCollectionManagerOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const loaded = await loadWorkspace();
        if (!active) return;
        setIcons(loaded.snapshot.icons);
        setCollections(loaded.snapshot.collections);
        setStorageDriver(loaded.driver);
        setWorkspaceBytes(workspaceSize(loaded.snapshot));
        setLastSavedAt(Date.now());
        setStorageState("saved");
        if (loaded.migrated) setToast("已将旧版数据安全迁移到浏览器数据库");
        setTheme(loadTheme());
        setSidebarCollapsed(localStorage.getItem("iconnest.sidebar.v1") === "collapsed");
      } catch {
        if (!active) return;
        setIcons(SEED_LIBRARY);
        setCollections(DEFAULT_COLLECTIONS);
        setStorageState("error");
      } finally {
        if (active) setHydrated(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const snapshot = { version: 3 as const, icons, collections };
    const timeout = window.setTimeout(() => {
      setStorageState("saving");
      void saveWorkspace(snapshot, storageDriver)
        .then(() => {
          setWorkspaceBytes(workspaceSize(snapshot));
          setLastSavedAt(Date.now());
          setStorageState("saved");
        })
        .catch(() => {
          setStorageState("error");
          setToast("本地保存失败，请立即导出备份");
        });
    }, 320);
    return () => window.clearTimeout(timeout);
  }, [collections, hydrated, icons, storageDriver]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      "iconnest.sidebar.v1",
      sidebarCollapsed ? "collapsed" : "expanded",
    );
  }, [hydrated, sidebarCollapsed]);

  useEffect(() => {
    let timeout: number | undefined;
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    if (hydrated) {
      try {
        saveTheme(theme);
      } catch {
        timeout = window.setTimeout(() => setToast("主题偏好无法保存"), 0);
      }
    }
    return () => window.clearTimeout(timeout);
  }, [hydrated, theme]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setMobileMenuOpen(false);
      setQuery("");
      setSelectedIds([]);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandMenuOpen((current) => !current);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setSidebarCollapsed((current) => !current);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "i") {
        event.preventDefault();
        uploadInputRef.current?.click();
      }
      if (event.key === "Escape") {
        setSelectedIconId(null);
        setMobileMenuOpen(false);
        setCreateCollectionOpen(false);
        setCollectionManagerOpen(false);
        setCommandMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const notify = useCallback((message: string) => setToast(message), []);

  const updateIcon = useCallback(
    (id: string, patch: Partial<IconItem>) => {
      setIcons((current) =>
        current.map((icon) => (icon.id === id ? { ...icon, ...patch } : icon)),
      );
    },
    [],
  );

  const addIcon = useCallback((icon: IconItem) => {
    setIcons((current) => [icon, ...current.filter((item) => item.id !== icon.id)]);
  }, []);

  const selectedIcon = useMemo(
    () => icons.find((icon) => icon.id === selectedIconId) ?? null,
    [icons, selectedIconId],
  );

  const activeIcons = useMemo(
    () => icons.filter((icon) => !icon.trashed),
    [icons],
  );

  const stats = useMemo(
    () => ({
      total: activeIcons.length,
      favorites: activeIcons.filter((icon) => icon.favorite).length,
      uploads: activeIcons.filter((icon) => Boolean(icon.svg)).length,
      sources: new Set(activeIcons.map((icon) => icon.source)).size,
      trash: icons.filter((icon) => icon.trashed).length,
    }),
    [activeIcons, icons],
  );

  const openIcon = useCallback(
    (id: string) => {
      updateIcon(id, { viewedAt: Date.now() });
      setSelectedIconId(id);
    },
    [updateIcon],
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      const item = icons.find((icon) => icon.id === id);
      if (!item) return;
      updateIcon(id, { favorite: !item.favorite });
      notify(item.favorite ? "已取消收藏" : "已加入收藏");
    },
    [icons, notify, updateIcon],
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }, []);

  const toggleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds((current) => {
      const allSelected = ids.every((id) => current.includes(id));
      return allSelected
        ? current.filter((id) => !ids.includes(id))
        : [...new Set([...current, ...ids])];
    });
  }, []);

  const bulkFavorite = useCallback(() => {
    const selected = new Set(selectedIds);
    setIcons((current) =>
      current.map((icon) =>
        selected.has(icon.id) ? { ...icon, favorite: true } : icon,
      ),
    );
    notify(`已收藏 ${selectedIds.length} 枚图标`);
  }, [notify, selectedIds]);

  const bulkMove = useCallback(
    (collection: string) => {
      if (!collection) return;
      const selected = new Set(selectedIds);
      setIcons((current) =>
        current.map((icon) =>
          selected.has(icon.id) ? { ...icon, collection } : icon,
        ),
      );
      notify(`已移动到「${collection}」`);
    },
    [notify, selectedIds],
  );

  const bulkTrash = useCallback(() => {
    const selected = new Set(selectedIds);
    setIcons((current) =>
      current.map((icon) =>
        selected.has(icon.id) ? { ...icon, trashed: true } : icon,
      ),
    );
    setSelectedIds([]);
    notify("所选图标已移至回收站");
  }, [notify, selectedIds]);

  const createCollection = useCallback(
    (name: string) => {
      const normalized = name.trim();
      if (!normalized) return false;
      if (collections.includes(normalized)) {
        notify("这个集合已经存在");
        return false;
      }
      setCollections((current) => [...current, normalized]);
      setCreateCollectionOpen(false);
      router.push(workspacePaths.collection(normalized));
      notify("集合已创建");
      return true;
    },
    [collections, notify, router],
  );

  const renameCollection = useCallback(
    (currentName: string, nextName: string) => {
      const normalized = nextName.trim();
      if (!normalized || normalized === currentName) return false;
      if (collections.includes(normalized)) {
        notify("这个集合已经存在");
        return false;
      }
      setCollections((current) =>
        current.map((item) => (item === currentName ? normalized : item)),
      );
      setIcons((current) =>
        current.map((icon) =>
          icon.collection === currentName
            ? { ...icon, collection: normalized }
            : icon,
        ),
      );
      if (pathname === workspacePaths.collection(currentName)) {
        router.replace(workspacePaths.collection(normalized));
      }
      notify("集合名称已更新");
      return true;
    },
    [collections, notify, pathname, router],
  );

  const deleteCollection = useCallback(
    (name: string) => {
      if (!collections.includes(name)) return false;
      const remaining = collections.filter((item) => item !== name);
      const fallback = remaining[0] ?? "未分类";
      setCollections(remaining.length ? remaining : [fallback]);
      setIcons((current) =>
        current.map((icon) =>
          icon.collection === name ? { ...icon, collection: fallback } : icon,
        ),
      );
      if (pathname === workspacePaths.collection(name)) {
        router.replace(workspacePaths.collection(fallback));
      }
      notify(`集合已移除，图标已转移到「${fallback}」`);
      return true;
    },
    [collections, notify, pathname, router],
  );

  const importCustomSvg = useCallback(
    (svg: string, name: string) => {
      if (icons.some((icon) => icon.svg === svg && !icon.trashed)) {
        notify("这枚 SVG 已经在图标库中");
        return;
      }
      const item: IconItem = {
        id: `upload-${crypto.randomUUID()}`,
        name,
        svg,
        source: "本地上传",
        tags: ["custom"],
        collection: collections[0] ?? "未分类",
        favorite: false,
        addedAt: Date.now(),
      };
      addIcon(item);
      router.push(workspacePaths.library);
      setSelectedIconId(item.id);
      notify("图标已安全导入");
    },
    [addIcon, collections, icons, notify, router],
  );

  const importSvgFiles = useCallback(
    async (files: File[]) => {
      const candidates = files.slice(0, 50);
      if (files.length > 50) notify("单次最多导入 50 个 SVG 文件");
      const existing = new Set(
        icons.filter((icon) => !icon.trashed && icon.svg).map((icon) => icon.svg),
      );
      const imported: IconItem[] = [];
      let skipped = 0;

      for (const file of candidates) {
        if (!file.name.toLowerCase().endsWith(".svg") || file.size > 512 * 1024) {
          skipped += 1;
          continue;
        }
        try {
          const svg = sanitizeSvg(await file.text());
          if (existing.has(svg)) {
            skipped += 1;
            continue;
          }
          existing.add(svg);
          imported.push({
            id: `upload-${crypto.randomUUID()}`,
            name: file.name.replace(/\.svg$/i, "") || "Untitled",
            svg,
            source: "本地上传",
            tags: ["custom"],
            collection: collections[0] ?? "未分类",
            favorite: false,
            addedAt: Date.now() + imported.length,
          });
        } catch {
          skipped += 1;
        }
      }

      if (!imported.length) {
        notify("没有可导入的 SVG；请检查格式、大小或重复项");
        return;
      }
      setIcons((current) => [...imported.reverse(), ...current]);
      router.push(workspacePaths.library);
      setSelectedIconId(imported.at(-1)?.id ?? null);
      notify(
        `已导入 ${imported.length} 枚图标${skipped ? `，跳过 ${skipped} 个文件` : ""}`,
      );
    },
    [collections, icons, notify, router],
  );

  const handleUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = "";
      if (!files.length) return;
      await importSvgFiles(files);
    },
    [importSvgFiles],
  );

  const pasteSvg = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      importCustomSvg(sanitizeSvg(text), "Pasted icon");
    } catch {
      notify("剪贴板中没有可用的 SVG");
    }
  }, [importCustomSvg, notify]);

  const exportWorkspace = useCallback(() => {
    const payload = {
      app: "IconNest",
      version: 3,
      exportedAt: new Date().toISOString(),
      icons,
      collections,
    };
    downloadBlob(
      new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      }),
      `iconnest-backup-${new Date().toISOString().slice(0, 10)}.json`,
    );
    notify("图标库备份已导出");
  }, [collections, icons, notify]);

  const exportSelected = useCallback(() => {
    const selected = new Set(selectedIds);
    const exportedIcons = icons.filter((icon) => selected.has(icon.id));
    void exportIconsZip(exportedIcons)
      .then(() => notify(`已打包导出 ${exportedIcons.length} 枚 SVG`))
      .catch(() => notify("ZIP 导出失败，请稍后重试"));
  }, [icons, notify, selectedIds]);

  const handleBackupImport = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      try {
        const snapshot = validateSnapshot(JSON.parse(await file.text()));
        if (!snapshot) throw new Error("备份文件格式不正确");
        setIcons(snapshot.icons);
        setCollections(snapshot.collections);
        router.push(workspacePaths.library);
        notify(`已恢复 ${snapshot.icons.length} 枚图标`);
      } catch (error) {
        notify(error instanceof Error ? error.message : "备份导入失败");
      }
    },
    [notify, router],
  );

  const writeClipboard = useCallback(
    async (content: string, success: string) => {
      try {
        await navigator.clipboard.writeText(content);
        notify(success);
      } catch {
        notify("复制失败，请稍后重试");
      }
    },
    [notify],
  );

  const copySvg = useCallback(
    async (icon: IconItem) => {
      try {
        await writeClipboard(await fetchIconSvg(icon), "SVG 已复制");
      } catch {
        notify("图标获取失败，请稍后重试");
      }
    },
    [notify, writeClipboard],
  );

  const copyReact = useCallback(
    async (icon: IconItem) => {
      try {
        const svg = await fetchIconSvg(icon);
        await writeClipboard(
          createReactIconSnippet(svg, icon.name),
          "React 组件已复制",
        );
      } catch {
        notify("组件生成失败，请稍后重试");
      }
    },
    [notify, writeClipboard],
  );

  const copyHtml = useCallback(
    async (icon: IconItem) => {
      try {
        await writeClipboard(await fetchIconSvg(icon), "HTML SVG 已复制");
      } catch {
        notify("HTML 复制失败，请稍后重试");
      }
    },
    [notify, writeClipboard],
  );

  const copyCss = useCallback(
    async (icon: IconItem) => {
      try {
        const slug =
          icon.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "iconnest";
        const source = svgDataUrl(await fetchIconSvg(icon));
        const snippet = `.icon-${slug} {\n  display: inline-block;\n  width: 1em;\n  height: 1em;\n  background: currentColor;\n  -webkit-mask: url("${source}") center / contain no-repeat;\n  mask: url("${source}") center / contain no-repeat;\n}`;
        await writeClipboard(snippet, "CSS Mask 已复制");
      } catch {
        notify("CSS 生成失败，请稍后重试");
      }
    },
    [notify, writeClipboard],
  );

  const downloadSvg = useCallback(
    async (icon: IconItem) => {
      try {
        const svg = await fetchIconSvg(icon);
        downloadBlob(
          new Blob([svg], { type: "image/svg+xml" }),
          `${icon.name.toLowerCase().replace(/\s+/g, "-")}.svg`,
        );
        notify("SVG 已开始下载");
      } catch {
        notify("下载失败，请稍后重试");
      }
    },
    [notify],
  );

  const downloadPng = useCallback(
    async (icon: IconItem, size = 512) => {
      try {
        await downloadIconPng(icon, size);
        notify(`${size}px PNG 已开始下载`);
      } catch {
        notify("PNG 生成失败，请稍后重试");
      }
    },
    [notify],
  );

  const value = useMemo<LibraryContextValue>(
    () => ({
      icons,
      collections,
      hydrated,
      storageDriver,
      storageState,
      workspaceBytes,
      lastSavedAt,
      theme,
      query,
      viewMode,
      sortMode,
      filterSource,
      selectedIds,
      selectedIcon,
      toast,
      mobileMenuOpen,
      createCollectionOpen,
      collectionManagerOpen,
      commandMenuOpen,
      sidebarCollapsed,
      uploadInputRef,
      backupInputRef,
      stats,
      setQuery,
      setViewMode,
      setSortMode,
      setFilterSource,
      setMobileMenuOpen,
      setCreateCollectionOpen,
      setCollectionManagerOpen,
      setCommandMenuOpen,
      setSidebarCollapsed,
      setSelectedIconId,
      notify,
      updateIcon,
      addIcon,
      openIcon,
      toggleFavorite,
      toggleSelection,
      clearSelection: () => setSelectedIds([]),
      toggleSelectAll,
      bulkFavorite,
      bulkMove,
      bulkTrash,
      restoreIcon: (id) => {
        updateIcon(id, { trashed: false });
        notify("图标已恢复");
      },
      deleteIcon: (id) => {
        setIcons((current) => current.filter((icon) => icon.id !== id));
        setSelectedIconId(null);
        notify("图标已永久删除");
      },
      createCollection,
      renameCollection,
      deleteCollection,
      pasteSvg,
      importSvgFiles,
      handleUpload,
      handleBackupImport,
      exportWorkspace,
      exportSelected,
      copySvg,
      copyReact,
      copyHtml,
      copyCss,
      downloadSvg,
      downloadPng,
      toggleTheme: () =>
        setTheme((current) => (current === "light" ? "dark" : "light")),
    }),
    [
      addIcon,
      bulkFavorite,
      bulkMove,
      bulkTrash,
      collections,
      copyCss,
      copyHtml,
      copyReact,
      copySvg,
      createCollection,
      createCollectionOpen,
      collectionManagerOpen,
      commandMenuOpen,
      deleteCollection,
      downloadSvg,
      downloadPng,
      exportSelected,
      exportWorkspace,
      filterSource,
      handleBackupImport,
      handleUpload,
      hydrated,
      importSvgFiles,
      icons,
      lastSavedAt,
      mobileMenuOpen,
      notify,
      openIcon,
      pasteSvg,
      query,
      renameCollection,
      selectedIcon,
      selectedIds,
      sidebarCollapsed,
      sortMode,
      stats,
      storageDriver,
      storageState,
      theme,
      toggleFavorite,
      toggleSelectAll,
      toggleSelection,
      toast,
      updateIcon,
      viewMode,
      workspaceBytes,
    ],
  );

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used inside LibraryProvider");
  }
  return context;
}
