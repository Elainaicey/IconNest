"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FolderPlus,
  Heart,
  LayoutGrid,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import { workspacePaths } from "@/lib/icons/paths";
import { IconArtwork } from "./icon-artwork";
import { useLibrary } from "./library-provider";

export function CommandMenu() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const {
    commandMenuOpen,
    setCommandMenuOpen,
    setCreateCollectionOpen,
    uploadInputRef,
    icons,
    openIcon,
  } = useLibrary();

  useEffect(() => {
    if (!commandMenuOpen) return;
    const timeout = window.setTimeout(() => {
      setValue("");
      inputRef.current?.focus();
    }, 40);
    return () => window.clearTimeout(timeout);
  }, [commandMenuOpen]);

  const results = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return icons.filter((icon) => !icon.trashed).slice(0, 5);
    return icons
      .filter((icon) => !icon.trashed)
      .filter((icon) =>
        [icon.name, icon.source, icon.collection, ...icon.tags]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 7);
  }, [icons, value]);

  if (!commandMenuOpen) return null;

  const close = () => setCommandMenuOpen(false);
  const navigate = (path: string) => {
    router.push(path);
    close();
  };

  return (
    <div className="modal-layer command-layer" role="presentation" onMouseDown={close}>
      <section
        className="command-menu acrylic-panel"
        role="dialog"
        aria-modal="true"
        aria-label="快捷命令"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <label className="command-search">
          <Search size={19} />
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="搜索图标，或选择一项操作…"
          />
          <kbd>ESC</kbd>
        </label>
        {!value && (
          <div className="command-section">
            <span>快速操作</span>
            <div className="command-actions">
              <button onClick={() => navigate(workspacePaths.library)} type="button">
                <LayoutGrid size={17} /> 图标库
              </button>
              <button onClick={() => navigate(workspacePaths.explore)} type="button">
                <Sparkles size={17} /> 探索图标
              </button>
              <button onClick={() => navigate(workspacePaths.favorites)} type="button">
                <Heart size={17} /> 我的收藏
              </button>
              <button
                onClick={() => {
                  close();
                  uploadInputRef.current?.click();
                }}
                type="button"
              >
                <Upload size={17} /> 导入 SVG
              </button>
              <button
                onClick={() => {
                  close();
                  setCreateCollectionOpen(true);
                }}
                type="button"
              >
                <FolderPlus size={17} /> 新建集合
              </button>
            </div>
          </div>
        )}
        <div className="command-section command-results">
          <span>{value ? "搜索结果" : "最近添加"}</span>
          {results.length ? (
            results.map((icon) => (
              <button
                key={icon.id}
                onClick={() => {
                  close();
                  openIcon(icon.id);
                }}
                type="button"
              >
                <i><IconArtwork item={icon} /></i>
                <span><strong>{icon.name}</strong><small>{icon.source} · {icon.collection}</small></span>
                <ArrowRight size={15} />
              </button>
            ))
          ) : (
            <p className="command-empty">没有找到匹配的图标</p>
          )}
        </div>
        <footer><span><kbd>⌘ K</kbd> 打开命令</span><span><kbd>⌘ I</kbd> 导入图标</span></footer>
      </section>
    </div>
  );
}
