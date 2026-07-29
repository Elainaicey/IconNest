"use client";

import {
  Archive,
  ArrowDownToLine,
  ArrowUpRight,
  Boxes,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Copy,
  Download,
  FileJson,
  FolderHeart,
  FolderPlus,
  Grid2X2,
  Heart,
  Import,
  Layers3,
  LayoutGrid,
  List,
  Menu,
  Moon,
  MoreHorizontal,
  PackageOpen,
  PanelLeftClose,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import {
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Section =
  | "library"
  | "explore"
  | "favorites"
  | "recent"
  | "trash"
  | "collection";

type ViewMode = "grid" | "list";

type IconItem = {
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

type IconifySearchResponse = {
  icons: string[];
  total: number;
};

type SourceFilter = {
  label: string;
  prefix: string;
  description: string;
  tone: string;
};

const STORAGE_KEY = "iconnest.library.v1";
const COLLECTIONS_KEY = "iconnest.collections.v1";
const THEME_KEY = "iconnest.theme.v1";
const SEED_NOW = Date.now();

const DEFAULT_COLLECTIONS = ["品牌资产", "产品界面", "社交媒体"];

const SOURCE_FILTERS: SourceFilter[] = [
  {
    label: "全部来源",
    prefix: "",
    description: "跨图标库搜索",
    tone: "#c9f65b",
  },
  {
    label: "Lucide",
    prefix: "lucide",
    description: "简洁线性",
    tone: "#f0b9cb",
  },
  {
    label: "Tabler",
    prefix: "tabler",
    description: "像素级精致",
    tone: "#b9dff4",
  },
  {
    label: "Phosphor",
    prefix: "ph",
    description: "灵活多风格",
    tone: "#dcc8f8",
  },
  {
    label: "Remix",
    prefix: "ri",
    description: "界面友好",
    tone: "#bce8d7",
  },
  {
    label: "Solar",
    prefix: "solar",
    description: "圆润现代",
    tone: "#f5d7a5",
  },
];

const SEED_LIBRARY: IconItem[] = [
  {
    id: "seed-sparkles",
    name: "Sparkles",
    iconifyId: "lucide:sparkles",
    source: "Lucide",
    tags: ["magic", "ai"],
    collection: "品牌资产",
    favorite: true,
    addedAt: SEED_NOW - 3600_000,
    viewedAt: SEED_NOW - 240_000,
  },
  {
    id: "seed-orbit",
    name: "Orbit",
    iconifyId: "lucide:orbit",
    source: "Lucide",
    tags: ["space", "brand"],
    collection: "品牌资产",
    favorite: true,
    addedAt: SEED_NOW - 7200_000,
  },
  {
    id: "seed-command",
    name: "Command",
    iconifyId: "tabler:command",
    source: "Tabler",
    tags: ["keyboard", "shortcut"],
    collection: "产品界面",
    favorite: false,
    addedAt: SEED_NOW - 8400_000,
  },
  {
    id: "seed-heart",
    name: "Heart",
    iconifyId: "ph:heart",
    source: "Phosphor",
    tags: ["like", "social"],
    collection: "社交媒体",
    favorite: true,
    addedAt: SEED_NOW - 10_800_000,
  },
  {
    id: "seed-bell",
    name: "Notification",
    iconifyId: "solar:bell-linear",
    source: "Solar",
    tags: ["alert", "ui"],
    collection: "产品界面",
    favorite: false,
    addedAt: SEED_NOW - 14_400_000,
  },
  {
    id: "seed-gallery",
    name: "Gallery",
    iconifyId: "ri:gallery-line",
    source: "Remix",
    tags: ["image", "media"],
    collection: "社交媒体",
    favorite: false,
    addedAt: SEED_NOW - 18_000_000,
  },
  {
    id: "seed-cursor",
    name: "Cursor Click",
    iconifyId: "tabler:pointer",
    source: "Tabler",
    tags: ["pointer", "action"],
    collection: "产品界面",
    favorite: false,
    addedAt: SEED_NOW - 21_600_000,
  },
  {
    id: "seed-paper-plane",
    name: "Send",
    iconifyId: "ph:paper-plane-tilt",
    source: "Phosphor",
    tags: ["send", "message"],
    collection: "社交媒体",
    favorite: false,
    addedAt: SEED_NOW - 25_200_000,
  },
  {
    id: "seed-badge",
    name: "Badge",
    iconifyId: "lucide:badge-check",
    source: "Lucide",
    tags: ["verified", "trust"],
    collection: "品牌资产",
    favorite: false,
    addedAt: SEED_NOW - 28_800_000,
  },
  {
    id: "seed-layers",
    name: "Layers",
    iconifyId: "solar:layers-linear",
    source: "Solar",
    tags: ["stack", "design"],
    collection: "产品界面",
    favorite: false,
    addedAt: SEED_NOW - 32_400_000,
  },
  {
    id: "seed-camera",
    name: "Camera",
    iconifyId: "ri:camera-3-line",
    source: "Remix",
    tags: ["photo", "social"],
    collection: "社交媒体",
    favorite: false,
    addedAt: SEED_NOW - 36_000_000,
  },
  {
    id: "seed-shapes",
    name: "Shapes",
    iconifyId: "tabler:shapes",
    source: "Tabler",
    tags: ["design", "brand"],
    collection: "品牌资产",
    favorite: true,
    addedAt: SEED_NOW - 43_200_000,
  },
];

const SOURCE_LABELS: Record<string, string> = {
  lucide: "Lucide",
  tabler: "Tabler",
  ph: "Phosphor",
  ri: "Remix",
  solar: "Solar",
};

function getSourceLabel(iconifyId: string) {
  const prefix = iconifyId.split(":")[0];
  return SOURCE_LABELS[prefix] ?? prefix.toUpperCase();
}

function getIconName(iconifyId: string) {
  const raw = iconifyId.split(":")[1] ?? iconifyId;
  return raw
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function iconifyUrl(iconifyId: string, height?: number) {
  const [prefix, name] = iconifyId.split(":");
  const suffix = height ? `?height=${height}` : "";
  return `https://api.iconify.design/${prefix}/${name}.svg${suffix}`;
}

function svgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function currentTimestamp() {
  return Date.now();
}

function artworkStyle(iconifyId: string, size: number): CSSProperties {
  const url = `url("${iconifyUrl(iconifyId)}")`;
  return {
    width: size,
    height: size,
    WebkitMaskImage: url,
    maskImage: url,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };
}

function IconArtwork({
  item,
  size = 36,
  color = "currentColor",
}: {
  item: Pick<IconItem, "name" | "svg" | "iconifyId">;
  size?: number;
  color?: string;
}) {
  if (item.svg) {
    return (
      <span
        className="icon-artwork-upload"
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          backgroundImage: `url("${svgDataUrl(item.svg)}")`,
        }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="icon-artwork-mask"
      style={{
        ...artworkStyle(item.iconifyId ?? "lucide:circle-help", size),
        backgroundColor: color,
      }}
    />
  );
}

function sanitizeSvg(input: string) {
  const documentNode = new DOMParser().parseFromString(input, "image/svg+xml");
  if (
    documentNode.querySelector("parsererror") ||
    documentNode.documentElement.tagName.toLowerCase() !== "svg"
  ) {
    throw new Error("这不是有效的 SVG 文件");
  }

  documentNode
    .querySelectorAll("script, foreignObject, iframe, object, embed")
    .forEach((node) => node.remove());

  documentNode.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      const key = attribute.name.toLowerCase();
      const value = attribute.value.toLowerCase().trim();
      if (
        key.startsWith("on") ||
        ((key === "href" || key === "xlink:href") &&
          value.startsWith("javascript:"))
      ) {
        node.removeAttribute(attribute.name);
      }
    });
  });

  return new XMLSerializer().serializeToString(documentNode.documentElement);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [library, setLibrary] = useState<IconItem[]>(SEED_LIBRARY);
  const [collections, setCollections] =
    useState<string[]>(DEFAULT_COLLECTIONS);
  const [section, setSection] = useState<Section>("library");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sourcePrefix, setSourcePrefix] = useState("");
  const [exploreQuery, setExploreQuery] = useState("arrow");
  const [exploreResults, setExploreResults] = useState<string[]>([
    "lucide:arrow-up-right",
    "tabler:arrow-narrow-right",
    "ph:arrow-circle-up-right",
    "ri:arrow-right-up-line",
    "solar:arrow-right-up-linear",
    "lucide:move-up-right",
    "tabler:arrows-diagonal",
    "ph:cursor-click",
    "ri:corner-right-up-line",
    "solar:round-arrow-right-up-linear",
  ]);
  const [exploreTotal, setExploreTotal] = useState(10);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [detailColor, setDetailColor] = useState("#141d1a");
  const uploadRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const savedLibrary = localStorage.getItem(STORAGE_KEY);
        const savedCollections = localStorage.getItem(COLLECTIONS_KEY);
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedLibrary) setLibrary(JSON.parse(savedLibrary) as IconItem[]);
        if (savedCollections)
          setCollections(JSON.parse(savedCollections) as string[]);
        if (savedTheme === "dark") setTheme("dark");
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(COLLECTIONS_KEY);
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  }, [hydrated, library]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  }, [collections, hydrated]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (hydrated) localStorage.setItem(THEME_KEY, theme);
  }, [hydrated, theme]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setSelectedId(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const selectedIcon = useMemo(
    () => library.find((icon) => icon.id === selectedId) ?? null,
    [library, selectedId],
  );

  const activeIcons = library.filter((icon) => !icon.trashed);
  const stats = {
    total: activeIcons.length,
    favorites: activeIcons.filter((icon) => icon.favorite).length,
    uploads: activeIcons.filter((icon) => Boolean(icon.svg)).length,
    sources: new Set(activeIcons.map((icon) => icon.source)).size,
  };

  const visibleIcons = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return library
      .filter((icon) => {
        if (section === "trash") return icon.trashed;
        if (icon.trashed) return false;
        if (section === "favorites") return icon.favorite;
        if (section === "recent") return Boolean(icon.viewedAt);
        if (section === "collection")
          return icon.collection === selectedCollection;
        return true;
      })
      .filter((icon) => {
        if (!normalized) return true;
        return [icon.name, icon.source, icon.collection, ...icon.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .sort((a, b) => {
        if (section === "recent")
          return (b.viewedAt ?? 0) - (a.viewedAt ?? 0);
        return b.addedAt - a.addedAt;
      });
  }, [library, query, section, selectedCollection]);

  const sectionTitle = useMemo(() => {
    if (section === "explore") return "探索图标";
    if (section === "favorites") return "我的收藏";
    if (section === "recent") return "最近浏览";
    if (section === "trash") return "回收站";
    if (section === "collection") return selectedCollection;
    return "图标库";
  }, [section, selectedCollection]);

  function notify(message: string) {
    setToast(message);
  }

  function navigate(nextSection: Section, collection = "") {
    setSection(nextSection);
    setSelectedCollection(collection);
    setMobileMenuOpen(false);
    setQuery("");
  }

  function updateIcon(id: string, patch: Partial<IconItem>) {
    setLibrary((current) =>
      current.map((icon) => (icon.id === id ? { ...icon, ...patch } : icon)),
    );
  }

  function openIcon(id: string) {
    updateIcon(id, { viewedAt: currentTimestamp() });
    setSelectedId(id);
  }

  function toggleFavorite(id: string) {
    const item = library.find((icon) => icon.id === id);
    if (!item) return;
    updateIcon(id, { favorite: !item.favorite });
    notify(item.favorite ? "已取消收藏" : "已加入收藏");
  }

  async function getSvg(icon: IconItem) {
    if (icon.svg) return icon.svg;
    if (!icon.iconifyId) throw new Error("图标内容不可用");
    const response = await fetch(iconifyUrl(icon.iconifyId));
    if (!response.ok) throw new Error("图标获取失败");
    return response.text();
  }

  async function copySvg(icon: IconItem) {
    try {
      await navigator.clipboard.writeText(await getSvg(icon));
      notify("SVG 已复制到剪贴板");
    } catch {
      notify("复制失败，请稍后重试");
    }
  }

  async function copyReact(icon: IconItem) {
    try {
      const svg = await getSvg(icon);
      const componentName =
        icon.name.replace(/[^a-zA-Z0-9]/g, "") || "IconNestIcon";
      const inner = svg
        .replace(/<svg[^>]*>/, "")
        .replace(/<\/svg>\s*$/, "")
        .replace(/class=/g, "className=")
        .replace(/stroke-width=/g, "strokeWidth=")
        .replace(/stroke-linecap=/g, "strokeLinecap=")
        .replace(/stroke-linejoin=/g, "strokeLinejoin=");
      const snippet = `export function ${componentName}Icon(props) {\n  return (\n    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>\n      ${inner.trim()}\n    </svg>\n  );\n}`;
      await navigator.clipboard.writeText(snippet);
      notify("React 组件已复制");
    } catch {
      notify("组件生成失败，请稍后重试");
    }
  }

  async function downloadSvg(icon: IconItem) {
    try {
      const svg = await getSvg(icon);
      downloadBlob(
        new Blob([svg], { type: "image/svg+xml" }),
        `${icon.name.toLowerCase().replace(/\s+/g, "-")}.svg`,
      );
      notify("SVG 已开始下载");
    } catch {
      notify("下载失败，请稍后重试");
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 256 * 1024) {
      notify("SVG 文件不能超过 256 KB");
      return;
    }
    try {
      const svg = sanitizeSvg(await file.text());
      const name = file.name.replace(/\.svg$/i, "") || "Untitled icon";
      const item: IconItem = {
        id: `upload-${crypto.randomUUID()}`,
        name,
        svg,
        source: "本地上传",
        tags: ["custom"],
        collection: collections[0] ?? "未分类",
        favorite: false,
        addedAt: currentTimestamp(),
      };
      setLibrary((current) => [item, ...current]);
      navigate("library");
      setSelectedId(item.id);
      notify("图标已安全导入");
    } catch (error) {
      notify(error instanceof Error ? error.message : "SVG 导入失败");
    }
  }

  async function searchExplore(
    event?: FormEvent,
    prefixOverride?: string,
  ) {
    event?.preventDefault();
    const keyword = exploreQuery.trim();
    if (!keyword) {
      notify("请输入搜索关键词");
      return;
    }
    setExploreLoading(true);
    try {
      const params = new URLSearchParams({
        query: keyword,
        limit: "96",
      });
      const activePrefix = prefixOverride ?? sourcePrefix;
      if (activePrefix) params.set("prefix", activePrefix);
      const response = await fetch(
        `https://api.iconify.design/search?${params.toString()}`,
      );
      if (!response.ok) throw new Error("搜索服务暂时不可用");
      const data = (await response.json()) as IconifySearchResponse;
      setExploreResults(data.icons);
      setExploreTotal(data.total);
    } catch (error) {
      notify(error instanceof Error ? error.message : "搜索失败");
    } finally {
      setExploreLoading(false);
    }
  }

  function addExploreIcon(iconifyId: string) {
    const existing = library.find((icon) => icon.iconifyId === iconifyId);
    if (existing) {
      if (existing.trashed) updateIcon(existing.id, { trashed: false });
      notify("这枚图标已经在库中");
      return;
    }
    const item: IconItem = {
      id: `iconify-${iconifyId.replace(":", "-")}`,
      name: getIconName(iconifyId),
      iconifyId,
      source: getSourceLabel(iconifyId),
      tags: exploreQuery.trim() ? [exploreQuery.trim().toLowerCase()] : [],
      collection: collections[0] ?? "未分类",
      favorite: false,
      addedAt: currentTimestamp(),
    };
    setLibrary((current) => [item, ...current]);
    notify("已添加到图标库");
  }

  function createCollection() {
    const name = window.prompt("为新集合命名");
    if (!name?.trim()) return;
    const normalized = name.trim();
    if (collections.includes(normalized)) {
      notify("这个集合已经存在");
      return;
    }
    setCollections((current) => [...current, normalized]);
    navigate("collection", normalized);
    notify("集合已创建");
  }

  function exportLibrary() {
    downloadBlob(
      new Blob(
        [
          JSON.stringify(
            {
              app: "IconNest",
              version: "0.1.0",
              exportedAt: new Date().toISOString(),
              collections,
              icons: library,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
      `iconnest-backup-${new Date().toISOString().slice(0, 10)}.json`,
    );
    notify("图标库备份已导出");
  }

  async function importLibrary(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text()) as {
        icons?: IconItem[];
        collections?: string[];
      };
      if (!Array.isArray(payload.icons)) throw new Error("备份文件格式不正确");
      const validIcons = payload.icons.filter(
        (icon) =>
          typeof icon.id === "string" &&
          typeof icon.name === "string" &&
          (typeof icon.svg === "string" || typeof icon.iconifyId === "string"),
      );
      if (!validIcons.length) throw new Error("备份中没有可导入的图标");
      setLibrary(validIcons);
      if (Array.isArray(payload.collections))
        setCollections(
          payload.collections.filter((item) => typeof item === "string"),
        );
      navigate("library");
      notify(`已恢复 ${validIcons.length} 枚图标`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "备份导入失败");
    }
  }

  const navItems = [
    { id: "library" as const, label: "我的图标库", icon: LayoutGrid },
    { id: "explore" as const, label: "探索图标", icon: Sparkles },
    { id: "favorites" as const, label: "已收藏", icon: Heart },
    { id: "recent" as const, label: "最近浏览", icon: Clock3 },
    { id: "trash" as const, label: "回收站", icon: Trash2 },
  ];

  return (
    <div className="app-shell">
      <div
        className={`mobile-overlay ${mobileMenuOpen ? "visible" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <Layers3 size={20} strokeWidth={2.2} />
          </span>
          <span className="brand-name">IconNest</span>
          <span className="version-badge">0.1</span>
          <button
            className="mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="关闭菜单"
          >
            <X size={18} />
          </button>
        </div>

        <button
          className="primary-import"
          onClick={() => uploadRef.current?.click()}
        >
          <Plus size={17} />
          导入 SVG
          <span className="button-shortcut">⌘ I</span>
        </button>

        <nav className="side-nav" aria-label="主要导航">
          <span className="nav-eyebrow">工作区</span>
          {navItems.map((item) => {
            const NavIcon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${active ? "active" : ""}`}
                onClick={() => navigate(item.id)}
              >
                <NavIcon size={17} strokeWidth={1.9} />
                <span>{item.label}</span>
                {item.id === "library" && (
                  <span className="nav-count">{stats.total}</span>
                )}
                {item.id === "favorites" && (
                  <span className="nav-count">{stats.favorites}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="collection-nav">
          <div className="collection-heading">
            <span className="nav-eyebrow">集合</span>
            <button onClick={createCollection} aria-label="新建集合">
              <FolderPlus size={16} />
            </button>
          </div>
          {collections.map((collection, index) => (
            <button
              key={collection}
              className={`nav-item collection-item ${
                section === "collection" &&
                selectedCollection === collection
                  ? "active"
                  : ""
              }`}
              onClick={() => navigate("collection", collection)}
            >
              <span
                className={`collection-dot collection-dot-${index % 4}`}
              />
              <span>{collection}</span>
              <span className="nav-count">
                {
                  activeIcons.filter(
                    (icon) => icon.collection === collection,
                  ).length
                }
              </span>
            </button>
          ))}
        </div>

        <div className="backup-card">
          <div className="backup-card-head">
            <Archive size={15} />
            <span>本地优先</span>
            <span className="status-dot" />
          </div>
          <p>数据只保存在这台设备，可随时备份与恢复。</p>
          <div className="backup-actions">
            <button onClick={exportLibrary}>
              <ArrowDownToLine size={14} />
              导出
            </button>
            <button onClick={() => importRef.current?.click()}>
              <Import size={14} />
              恢复
            </button>
          </div>
        </div>

        <button className="profile-row" aria-label="工作区设置">
          <span className="avatar">IN</span>
          <span>
            <strong>我的工作区</strong>
            <small>Personal vault</small>
          </span>
          <MoreHorizontal size={17} />
        </button>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="打开菜单"
          >
            <Menu size={20} />
          </button>
          <div className="global-search">
            <Search size={18} />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索名称、来源、标签或集合…"
              aria-label="搜索图标库"
            />
            {query ? (
              <button onClick={() => setQuery("")} aria-label="清空搜索">
                <X size={16} />
              </button>
            ) : (
              <kbd>⌘ K</kbd>
            )}
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button"
              onClick={() =>
                setTheme((current) =>
                  current === "light" ? "dark" : "light",
                )
              }
              aria-label={theme === "light" ? "切换到深色模式" : "切换到浅色模式"}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              className="top-import"
              onClick={() => uploadRef.current?.click()}
            >
              <Upload size={16} />
              上传图标
            </button>
          </div>
        </header>

        <main className="main-content">
          {section === "library" && !query && (
            <section className="hero-card">
              <div className="hero-copy">
                <span className="hero-kicker">
                  <Sparkles size={14} />
                  YOUR ICON HOME
                </span>
                <h1>
                  让每一枚图标，
                  <br />
                  都回到该在的位置。
                </h1>
                <p>
                  收集、整理并交付你喜爱的图标。一个轻盈、私密，且真正属于你的创意工作台。
                </p>
                <div className="hero-actions">
                  <button
                    className="hero-primary"
                    onClick={() => navigate("explore")}
                  >
                    探索图标
                    <ArrowUpRight size={16} />
                  </button>
                  <button
                    className="hero-secondary"
                    onClick={() => uploadRef.current?.click()}
                  >
                    <Upload size={15} />
                    上传 SVG
                  </button>
                </div>
              </div>
              <div className="hero-visual" aria-hidden="true">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="floating-card card-one">
                  <IconArtwork
                    item={{
                      name: "Sparkles",
                      iconifyId: "lucide:sparkles",
                    }}
                    size={34}
                  />
                </div>
                <div className="floating-card card-two">
                  <IconArtwork
                    item={{ name: "Heart", iconifyId: "ph:heart" }}
                    size={30}
                  />
                </div>
                <div className="floating-card card-three">
                  <IconArtwork
                    item={{ name: "Shapes", iconifyId: "tabler:shapes" }}
                    size={38}
                  />
                </div>
                <div className="hero-center-mark">
                  <Layers3 size={28} />
                </div>
                <span className="hero-spark spark-one">✦</span>
                <span className="hero-spark spark-two">✦</span>
              </div>
              <div className="hero-stats">
                <div>
                  <strong>{stats.total}</strong>
                  <span>已收集</span>
                </div>
                <div>
                  <strong>{stats.sources}</strong>
                  <span>图标来源</span>
                </div>
                <div>
                  <strong>{stats.favorites}</strong>
                  <span>已收藏</span>
                </div>
              </div>
            </section>
          )}

          {section === "explore" ? (
            <section className="explore-section">
              <div className="page-heading explore-heading">
                <div>
                  <span className="section-kicker">ICON DISCOVERY</span>
                  <h2>从优秀的开源图标库中发现灵感</h2>
                  <p>统一搜索、即时预览，一键收入你的私人图标库。</p>
                </div>
                <span className="api-badge">
                  <Zap size={14} fill="currentColor" />
                  Powered by Iconify
                </span>
              </div>

              <form className="explore-search" onSubmit={searchExplore}>
                <Search size={20} />
                <input
                  value={exploreQuery}
                  onChange={(event) => setExploreQuery(event.target.value)}
                  placeholder="试试搜索 arrow、camera、home…"
                  aria-label="搜索开源图标"
                />
                <button type="submit" disabled={exploreLoading}>
                  {exploreLoading ? "搜索中…" : "搜索"}
                </button>
              </form>

              <div className="source-strip">
                {SOURCE_FILTERS.map((source) => (
                  <button
                    key={source.label}
                    className={sourcePrefix === source.prefix ? "active" : ""}
                    onClick={() => {
                      setSourcePrefix(source.prefix);
                      void searchExplore(undefined, source.prefix);
                    }}
                  >
                    <span
                      className="source-orb"
                      style={{ background: source.tone }}
                    >
                      {source.label.slice(0, 1)}
                    </span>
                    <span>
                      <strong>{source.label}</strong>
                      <small>{source.description}</small>
                    </span>
                    {sourcePrefix === source.prefix && <Check size={14} />}
                  </button>
                ))}
              </div>

              <div className="explore-results-head">
                <span>
                  {exploreLoading
                    ? "正在翻找图标…"
                    : `找到 ${exploreTotal.toLocaleString()} 个结果`}
                </span>
                <span className="license-note">
                  使用前请确认对应图标库的许可协议
                </span>
              </div>

              <div className="explore-grid">
                {exploreLoading
                  ? Array.from({ length: 18 }).map((_, index) => (
                      <div className="explore-card loading" key={index} />
                    ))
                  : exploreResults.map((iconifyId) => {
                      const inLibrary = library.some(
                        (icon) => icon.iconifyId === iconifyId && !icon.trashed,
                      );
                      return (
                        <article className="explore-card" key={iconifyId}>
                          <span className="source-mini">
                            {getSourceLabel(iconifyId)}
                          </span>
                          <div className="explore-art">
                            <IconArtwork
                              item={{
                                name: getIconName(iconifyId),
                                iconifyId,
                              }}
                              size={38}
                            />
                          </div>
                          <strong>{getIconName(iconifyId)}</strong>
                          <small>{iconifyId}</small>
                          <button
                            className={inLibrary ? "added" : ""}
                            onClick={() => addExploreIcon(iconifyId)}
                            aria-label={
                              inLibrary
                                ? "已在图标库"
                                : `添加 ${getIconName(iconifyId)}`
                            }
                          >
                            {inLibrary ? <Check size={15} /> : <Plus size={15} />}
                          </button>
                        </article>
                      );
                    })}
              </div>
            </section>
          ) : (
            <section className="library-section">
              <div className="library-heading">
                <div>
                  <span className="section-kicker">YOUR COLLECTION</span>
                  <h2>{sectionTitle}</h2>
                  <p>
                    {query
                      ? `“${query}” 的搜索结果`
                      : `${visibleIcons.length} 枚图标 · 最近自动保存`}
                  </p>
                </div>
                <div className="library-tools">
                  <div className="view-toggle" aria-label="视图模式">
                    <button
                      className={viewMode === "grid" ? "active" : ""}
                      onClick={() => setViewMode("grid")}
                      aria-label="网格视图"
                    >
                      <Grid2X2 size={16} />
                    </button>
                    <button
                      className={viewMode === "list" ? "active" : ""}
                      onClick={() => setViewMode("list")}
                      aria-label="列表视图"
                    >
                      <List size={17} />
                    </button>
                  </div>
                  <button className="filter-button">
                    <Settings2 size={15} />
                    筛选
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>

              {visibleIcons.length ? (
                <div
                  className={
                    viewMode === "grid" ? "icon-grid" : "icon-list"
                  }
                >
                  {visibleIcons.map((icon, index) => (
                    <article
                      className="library-card"
                      key={icon.id}
                      style={{ "--card-index": index } as CSSProperties}
                    >
                      <button
                        className="card-main"
                        onClick={() => openIcon(icon.id)}
                        aria-label={`查看 ${icon.name}`}
                      >
                        <span className="icon-stage">
                          <IconArtwork item={icon} size={38} />
                          {icon.svg && <span className="custom-chip">OWN</span>}
                        </span>
                        <span className="card-meta">
                          <strong>{icon.name}</strong>
                          <small>
                            {icon.source} · {icon.collection}
                          </small>
                        </span>
                      </button>
                      <div className="card-quick-actions">
                        {section === "trash" ? (
                          <button
                            onClick={() => {
                              updateIcon(icon.id, { trashed: false });
                              notify("图标已恢复");
                            }}
                            aria-label="恢复图标"
                          >
                            <RotateCcw size={15} />
                          </button>
                        ) : (
                          <>
                            <button
                              className={icon.favorite ? "favorite" : ""}
                              onClick={() => toggleFavorite(icon.id)}
                              aria-label={icon.favorite ? "取消收藏" : "收藏"}
                            >
                              <Heart
                                size={15}
                                fill={icon.favorite ? "currentColor" : "none"}
                              />
                            </button>
                            <button
                              onClick={() => copySvg(icon)}
                              aria-label="复制 SVG"
                            >
                              <Copy size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">
                    {section === "trash" ? (
                      <Trash2 size={28} />
                    ) : (
                      <PackageOpen size={30} />
                    )}
                  </span>
                  <h3>
                    {section === "trash"
                      ? "回收站空空如也"
                      : "这里还没有图标"}
                  </h3>
                  <p>
                    {section === "trash"
                      ? "被移除的图标会先来到这里。"
                      : "上传自己的 SVG，或去探索页发现新图标。"}
                  </p>
                  {section !== "trash" && (
                    <button onClick={() => navigate("explore")}>
                      <Sparkles size={15} />
                      去探索
                    </button>
                  )}
                </div>
              )}

              {section === "library" && !query && (
                <div className="source-footer">
                  <div>
                    <span className="source-footer-icon">
                      <Boxes size={18} />
                    </span>
                    <span>
                      <strong>连接 5 个图标来源</strong>
                      <small>
                        Lucide、Tabler、Phosphor、Remix 与 Solar
                      </small>
                    </span>
                  </div>
                  <button onClick={() => navigate("explore")}>
                    查看全部来源
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      <div
        className={`detail-backdrop ${selectedIcon ? "visible" : ""}`}
        onClick={() => setSelectedId(null)}
      />
      <aside
        className={`detail-panel ${selectedIcon ? "open" : ""}`}
        aria-hidden={!selectedIcon}
      >
        {selectedIcon && (
          <>
            <div className="detail-header">
              <span>图标详情</span>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="关闭详情"
              >
                <X size={18} />
              </button>
            </div>

            <div className="detail-preview">
              <div className="preview-grid-bg" />
              <IconArtwork
                item={selectedIcon}
                size={92}
                color={detailColor}
              />
              <span className="preview-size">24 × 24</span>
            </div>

            <div className="detail-title">
              <div>
                <h3>{selectedIcon.name}</h3>
                <span>{selectedIcon.iconifyId ?? "自定义 SVG"}</span>
              </div>
              <button
                className={selectedIcon.favorite ? "favorite" : ""}
                onClick={() => toggleFavorite(selectedIcon.id)}
                aria-label="切换收藏"
              >
                <Heart
                  size={19}
                  fill={selectedIcon.favorite ? "currentColor" : "none"}
                />
              </button>
            </div>

            <div className="detail-fields">
              <label>
                <span>颜色</span>
                <span className="color-control">
                  <input
                    type="color"
                    value={detailColor}
                    onChange={(event) => setDetailColor(event.target.value)}
                  />
                  <code>{detailColor.toUpperCase()}</code>
                </span>
              </label>
              <label>
                <span>集合</span>
                <select
                  value={selectedIcon.collection}
                  onChange={(event) =>
                    updateIcon(selectedIcon.id, {
                      collection: event.target.value,
                    })
                  }
                >
                  {collections.map((collection) => (
                    <option key={collection}>{collection}</option>
                  ))}
                </select>
              </label>
              <div className="tag-field">
                <span>标签</span>
                <div>
                  {selectedIcon.tags.length ? (
                    selectedIcon.tags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))
                  ) : (
                    <small>暂无标签</small>
                  )}
                </div>
              </div>
            </div>

            <div className="detail-action-grid">
              <button onClick={() => copySvg(selectedIcon)}>
                <Copy size={17} />
                <span>
                  <strong>复制 SVG</strong>
                  <small>保留矢量格式</small>
                </span>
              </button>
              <button onClick={() => copyReact(selectedIcon)}>
                <Code2 size={17} />
                <span>
                  <strong>复制 React</strong>
                  <small>组件代码</small>
                </span>
              </button>
              <button onClick={() => downloadSvg(selectedIcon)}>
                <Download size={17} />
                <span>
                  <strong>下载文件</strong>
                  <small>.svg 格式</small>
                </span>
              </button>
              <button
                onClick={() => {
                  exportLibrary();
                }}
              >
                <FileJson size={17} />
                <span>
                  <strong>备份图标库</strong>
                  <small>.json 格式</small>
                </span>
              </button>
            </div>

            <div className="detail-source">
              <span className="source-logo">
                {selectedIcon.source.slice(0, 1)}
              </span>
              <span>
                <small>来源</small>
                <strong>{selectedIcon.source}</strong>
              </span>
              {selectedIcon.iconifyId && (
                <a
                  href={`https://icon-sets.iconify.design/${
                    selectedIcon.iconifyId.split(":")[0]
                  }/${selectedIcon.iconifyId.split(":")[1]}/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  查看原始页面
                  <ArrowUpRight size={14} />
                </a>
              )}
            </div>

            <button
              className="danger-action"
              onClick={() => {
                if (selectedIcon.trashed) {
                  setLibrary((current) =>
                    current.filter((icon) => icon.id !== selectedIcon.id),
                  );
                  notify("图标已永久删除");
                } else {
                  updateIcon(selectedIcon.id, { trashed: true });
                  notify("图标已移至回收站");
                }
                setSelectedId(null);
              }}
            >
              <Trash2 size={15} />
              {selectedIcon.trashed ? "永久删除" : "移至回收站"}
            </button>
          </>
        )}
      </aside>

      <input
        ref={uploadRef}
        className="visually-hidden"
        type="file"
        accept=".svg,image/svg+xml"
        onChange={handleUpload}
      />
      <input
        ref={importRef}
        className="visually-hidden"
        type="file"
        accept=".json,application/json"
        onChange={importLibrary}
      />

      <div className={`toast ${toast ? "visible" : ""}`} role="status">
        <span>
          <Check size={14} />
        </span>
        {toast}
      </div>

      <nav className="mobile-bottom-nav" aria-label="移动端导航">
        <button
          className={section === "library" ? "active" : ""}
          onClick={() => navigate("library")}
        >
          <LayoutGrid size={19} />
          图标库
        </button>
        <button
          className={section === "explore" ? "active" : ""}
          onClick={() => navigate("explore")}
        >
          <Sparkles size={19} />
          探索
        </button>
        <button
          className="mobile-add"
          onClick={() => uploadRef.current?.click()}
          aria-label="上传图标"
        >
          <Plus size={22} />
        </button>
        <button
          className={section === "favorites" ? "active" : ""}
          onClick={() => navigate("favorites")}
        >
          <FolderHeart size={19} />
          收藏
        </button>
        <button onClick={() => setMobileMenuOpen(true)}>
          <PanelLeftClose size={19} />
          更多
        </button>
      </nav>
    </div>
  );
}
