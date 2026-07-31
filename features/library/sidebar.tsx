"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  ArrowDownToLine,
  Clock3,
  FolderPlus,
  FolderCog,
  Heart,
  Import,
  Layers3,
  LayoutGrid,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { workspacePaths } from "@/lib/icons/paths";
import { useLibrary } from "./library-provider";

const NAV_ITEMS = [
  {
    href: workspacePaths.library,
    label: "图标库",
    icon: LayoutGrid,
    stat: "total" as const,
  },
  {
    href: workspacePaths.explore,
    label: "探索图标",
    icon: Sparkles,
  },
  {
    href: workspacePaths.favorites,
    label: "我的收藏",
    icon: Heart,
    stat: "favorites" as const,
  },
  {
    href: workspacePaths.recent,
    label: "最近浏览",
    icon: Clock3,
  },
  {
    href: workspacePaths.trash,
    label: "回收站",
    icon: Trash2,
    stat: "trash" as const,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    icons,
    collections,
    mobileMenuOpen,
    setMobileMenuOpen,
    setCreateCollectionOpen,
    uploadInputRef,
    backupInputRef,
    exportWorkspace,
    stats,
    hydrated,
    storageDriver,
    storageState,
    workspaceBytes,
    setCollectionManagerOpen,
  } = useLibrary();

  return (
    <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
      <div className="brand-row">
        <Link className="brand" href={workspacePaths.library}>
          <span className="brand-mark">
            <Layers3 size={19} strokeWidth={2.2} />
          </span>
          <span>
            <strong>IconNest</strong>
            <small>Icon workspace</small>
          </span>
        </Link>
        <button
          className="mobile-close"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="关闭菜单"
          type="button"
        >
          <X size={18} />
        </button>
      </div>

      <button
        className="primary-action"
        onClick={() => uploadInputRef.current?.click()}
        type="button"
      >
        <Plus size={17} />
        导入 SVG
        <kbd>⌘ I</kbd>
      </button>

      <nav className="side-nav" aria-label="主要导航">
        <span className="nav-eyebrow">工作区</span>
        {NAV_ITEMS.map((item) => {
          const NavIcon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              className={`nav-item ${active ? "active" : ""}`}
              href={item.href}
              aria-current={active ? "page" : undefined}
            >
              <NavIcon size={17} strokeWidth={1.9} />
              <span>{item.label}</span>
              {item.stat && <span className="nav-count">{stats[item.stat]}</span>}
            </Link>
          );
        })}
      </nav>

      <nav className="collection-nav" aria-label="图标集合">
        <div className="collection-heading">
          <span className="nav-eyebrow">集合</span>
          <button
            onClick={() => setCreateCollectionOpen(true)}
            aria-label="新建集合"
            data-tooltip="新建集合"
            type="button"
          >
            <FolderPlus size={16} />
          </button>
          <button
            onClick={() => setCollectionManagerOpen(true)}
            aria-label="管理集合"
            data-tooltip="管理集合"
            type="button"
          >
            <FolderCog size={16} />
          </button>
        </div>
        {collections.map((collection, index) => {
          const href = workspacePaths.collection(collection);
          const active = pathname === href;
          const count = icons.filter(
            (icon) => !icon.trashed && icon.collection === collection,
          ).length;
          return (
            <Link
              key={collection}
              className={`nav-item ${active ? "active" : ""}`}
              href={href}
              aria-current={active ? "page" : undefined}
            >
              <span className={`collection-dot tone-${index % 5}`} />
              <span className="nav-label">{collection}</span>
              <span className="nav-count">{count}</span>
            </Link>
          );
        })}
      </nav>

      <div className="storage-panel">
        <div className="storage-status">
          <span className="storage-icon">
            <Archive size={15} />
          </span>
          <span>
            <strong>本地工作区</strong>
            <small>
              {!hydrated
                ? "正在读取数据"
                : storageState === "error"
                  ? "保存异常，请导出备份"
                  : `${storageDriver === "indexeddb" ? "浏览器数据库" : "兼容存储"} · ${formatBytes(workspaceBytes)}`}
            </small>
          </span>
          <i className={hydrated && storageState !== "error" ? "ready" : ""} />
        </div>
        <div className="storage-actions">
          <button onClick={exportWorkspace} type="button">
            <ArrowDownToLine size={14} />
            导出备份
          </button>
          <button onClick={() => backupInputRef.current?.click()} type="button">
            <Import size={14} />
            恢复
          </button>
        </div>
      </div>
    </aside>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
