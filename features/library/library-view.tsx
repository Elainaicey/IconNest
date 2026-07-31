"use client";

import Link from "next/link";
import {
  ArrowUpDown,
  CheckSquare2,
  ClipboardPaste,
  Download,
  FolderInput,
  Grid2X2,
  Heart,
  List,
  PackageOpen,
  SlidersHorizontal,
  Sparkles,
  Square,
  Trash2,
  Upload,
  ShieldCheck,
  Database,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AmbientParticles } from "@/components/ui/ambient-particles";
import { routeTitle, workspacePaths } from "@/lib/icons/paths";
import type { IconItem, WorkspaceRoute } from "@/lib/icons/types";
import { IconGrid } from "./icon-grid";
import { useLibrary } from "./library-provider";

const ROUTE_DESCRIPTIONS: Record<
  Exclude<WorkspaceRoute["kind"], "collection">,
  string
> = {
  library: "你的全部可用图标",
  explore: "",
  favorites: "标记为收藏的图标",
  recent: "最近打开过的图标",
  trash: "已移除、仍可恢复的图标",
};

export function LibraryView({ route }: { route: WorkspaceRoute }) {
  const [dragging, setDragging] = useState(false);
  const {
    icons,
    collections,
    query,
    viewMode,
    sortMode,
    filterSource,
    selectedIds,
    stats,
    uploadInputRef,
    setViewMode,
    setSortMode,
    setFilterSource,
    toggleSelectAll,
    bulkFavorite,
    bulkMove,
    bulkTrash,
    exportSelected,
    pasteSvg,
    importSvgFiles,
    storageDriver,
  } = useLibrary();

  const activeIcons = useMemo(
    () => icons.filter((icon) => !icon.trashed),
    [icons],
  );

  const visibleIcons = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return icons
      .filter((icon) => matchesRoute(icon, route))
      .filter((icon) => {
        if (filterSource !== "all" && icon.source !== filterSource) return false;
        if (!normalized) return true;
        return [icon.name, icon.source, icon.collection, ...icon.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .sort((a, b) => {
        if (route.kind === "recent") {
          return (b.viewedAt ?? 0) - (a.viewedAt ?? 0);
        }
        if (sortMode === "name") return a.name.localeCompare(b.name, "zh-CN");
        if (sortMode === "source") {
          return a.source.localeCompare(b.source, "zh-CN");
        }
        return b.addedAt - a.addedAt;
      });
  }, [filterSource, icons, query, route, sortMode]);

  const availableSources = useMemo(
    () => [...new Set(activeIcons.map((icon) => icon.source))].sort(),
    [activeIcons],
  );
  const visibleIds = visibleIcons.map((icon) => icon.id);
  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedIds.includes(id));
  const description =
    route.kind === "collection"
      ? "当前集合"
      : ROUTE_DESCRIPTIONS[route.kind];

  return (
    <div className="workspace-page">
      {route.kind === "library" && !query && (
        <section className="overview-band" aria-label="工作区概览">
          <AmbientParticles />
          <div className="overview-main">
            <div className="overview-copy">
              <span className="hero-pill"><Sparkles size={13} /> PERSONAL ICON VAULT</span>
              <h1>让每一枚图标都有清晰归处</h1>
              <p>收集、整理、预览与交付，在一个轻盈而可靠的本地工作区完成。</p>
              <div className="hero-trust-row">
                <span><Database size={14} /> {storageDriver === "indexeddb" ? "IndexedDB 持久保存" : "浏览器本地保存"}</span>
                <span><ShieldCheck size={14} /> SVG 安全净化</span>
              </div>
            </div>
            <dl className="overview-stats">
              <div><dt>全部图标</dt><dd>{stats.total}</dd><small>随时可用</small></div>
              <div><dt>图标来源</dt><dd>{stats.sources}</dd><small>统一管理</small></div>
              <div><dt>已收藏</dt><dd>{stats.favorites}</dd><small>灵感精选</small></div>
            </dl>
            <div className="overview-actions">
              <Link className="button button-solid" href={workspacePaths.explore}>
                <Sparkles size={15} /> 探索图标
              </Link>
              <button className="button button-soft" onClick={() => uploadInputRef.current?.click()} type="button">
                <Upload size={15} /> 批量上传
              </button>
              <button className="button button-ghost" onClick={pasteSvg} type="button">
                <ClipboardPaste size={15} /> 粘贴 SVG
              </button>
            </div>
          </div>
          <button
            className={`hero-dropzone ${dragging ? "dragging" : ""}`}
            onClick={() => uploadInputRef.current?.click()}
            onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void importSvgFiles(Array.from(event.dataTransfer.files));
            }}
            type="button"
          >
            <span><Upload size={21} /></span>
            <strong>拖入你的 SVG</strong>
            <small>单次至多 50 枚 · 每枚 512 KB</small>
          </button>
        </section>
      )}

      <header className="page-header">
        <div>
          <span className="section-kicker">
            {route.kind === "trash" ? "RECOVERY" : "YOUR COLLECTION"}
          </span>
          <h1>{routeTitle(route)}</h1>
          <p>
            {query ? `“${query}” 的搜索结果` : description}
            <span aria-hidden> · </span>
            {visibleIcons.length} 枚
          </p>
        </div>
        <div className="view-controls">
          <label className="select-control">
            <SlidersHorizontal size={14} />
            <select
              value={filterSource}
              onChange={(event) => setFilterSource(event.target.value)}
              aria-label="按来源筛选"
            >
              <option value="all">全部来源</option>
              {availableSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>
          <label className="select-control">
            <ArrowUpDown size={14} />
            <select
              value={sortMode}
              onChange={(event) =>
                setSortMode(event.target.value as typeof sortMode)
              }
              aria-label="排序方式"
            >
              <option value="newest">最近添加</option>
              <option value="name">名称排序</option>
              <option value="source">来源排序</option>
            </select>
          </label>
          <div className="segmented-control" aria-label="视图模式">
            <button
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
              aria-label="网格视图"
              data-tooltip="网格视图"
              type="button"
            >
              <Grid2X2 size={15} />
            </button>
            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              aria-label="列表视图"
              data-tooltip="列表视图"
              type="button"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </header>

      {visibleIcons.length > 0 ? (
        <>
          <div className={`bulk-bar ${selectedIds.length ? "active" : ""}`}>
            <button
              className="bulk-select"
              onClick={() => toggleSelectAll(visibleIds)}
              type="button"
            >
              {allVisibleSelected ? (
                <CheckSquare2 size={16} />
              ) : (
                <Square size={16} />
              )}
              {selectedIds.length
                ? `已选择 ${selectedIds.length} 枚`
                : "批量选择"}
            </button>
            {selectedIds.length > 0 && (
              <>
                <span className="toolbar-separator" />
                <button onClick={bulkFavorite} type="button">
                  <Heart size={15} />
                  收藏
                </button>
                <label>
                  <FolderInput size={15} />
                  <select
                    defaultValue=""
                    onChange={(event) => {
                      bulkMove(event.target.value);
                      event.target.value = "";
                    }}
                    aria-label="批量移动到集合"
                  >
                    <option value="" disabled>
                      移动到…
                    </option>
                    {collections.map((collection) => (
                      <option key={collection} value={collection}>
                        {collection}
                      </option>
                    ))}
                  </select>
                </label>
                <button onClick={exportSelected} type="button">
                  <Download size={15} />
                  导出 ZIP
                </button>
                <button className="danger" onClick={bulkTrash} type="button">
                  <Trash2 size={15} />
                  删除
                </button>
              </>
            )}
          </div>
          <IconGrid icons={visibleIcons} mode={viewMode} />
        </>
      ) : (
        <div className="empty-state">
          <span>
            {route.kind === "trash" ? (
              <Trash2 size={26} />
            ) : (
              <PackageOpen size={28} />
            )}
          </span>
          <h2>{route.kind === "trash" ? "回收站为空" : "没有匹配的图标"}</h2>
          <p>
            {query
              ? "调整搜索词或筛选条件后再试。"
              : route.kind === "trash"
                ? "被移除的图标会暂时保留在这里。"
                : "从探索页添加图标，或上传自己的 SVG。"}
          </p>
          {route.kind !== "trash" && (
            <Link className="button button-soft" href={workspacePaths.explore}>
              <Sparkles size={15} />
              打开探索页
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function matchesRoute(icon: IconItem, route: WorkspaceRoute) {
  if (route.kind === "trash") return Boolean(icon.trashed);
  if (icon.trashed) return false;
  if (route.kind === "favorites") return icon.favorite;
  if (route.kind === "recent") return Boolean(icon.viewedAt);
  if (route.kind === "collection") return icon.collection === route.collection;
  return true;
}
