"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
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
import { useMemo, useRef, useState } from "react";
import { workspacePaths } from "@/lib/icons/paths";
import { IconArtwork } from "./icon-artwork";
import { useLibrary } from "./library-provider";

export function CommandMenu() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const {
    commandMenuOpen,
    setCommandMenuOpen,
    setCreateCollectionOpen,
    uploadInputRef,
    icons,
    openIcon,
  } = useLibrary();

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

  const close = () => setCommandMenuOpen(false);
  const navigate = (path: string) => {
    router.push(path);
    close();
  };
  const chooseIcon = (index: number) => {
    const icon = results[index];
    if (!icon) return;
    close();
    openIcon(icon.id);
  };

  return (
    <DialogPrimitive.Root open={commandMenuOpen} onOpenChange={setCommandMenuOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="modal-layer command-layer" />
        <DialogPrimitive.Content
          className="command-menu acrylic-panel"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            setValue("");
            setActiveIndex(icons.some((icon) => !icon.trashed) ? 0 : -1);
            inputRef.current?.focus();
          }}
        >
          <DialogPrimitive.Title className="visually-hidden">
            快捷命令
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="visually-hidden">
            搜索图标或执行工作区操作
          </DialogPrimitive.Description>

          <label className="command-search">
            <Search size={19} />
            <input
              ref={inputRef}
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveIndex((current) =>
                    results.length ? (current + 1) % results.length : -1,
                  );
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveIndex((current) =>
                    results.length
                      ? (current - 1 + results.length) % results.length
                      : -1,
                  );
                }
                if (event.key === "Enter" && activeIndex >= 0) {
                  event.preventDefault();
                  chooseIcon(activeIndex);
                }
              }}
              placeholder="搜索图标，或选择一项操作…"
              aria-label="搜索图标和命令"
              role="combobox"
              aria-expanded="true"
              aria-controls="command-results"
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? `command-result-${activeIndex}` : undefined
              }
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

          <div
            className="command-section command-results"
            id="command-results"
            role="listbox"
            aria-label={value ? "搜索结果" : "最近添加"}
          >
            <span>{value ? "搜索结果" : "最近添加"}</span>
            {results.length ? (
              results.map((icon, index) => (
                <button
                  id={`command-result-${index}`}
                  className={activeIndex === index ? "active" : ""}
                  key={icon.id}
                  onClick={() => chooseIcon(index)}
                  onPointerMove={() => setActiveIndex(index)}
                  role="option"
                  aria-selected={activeIndex === index}
                  type="button"
                >
                  <i><IconArtwork item={icon} /></i>
                  <span>
                    <strong>{icon.name}</strong>
                    <small>{icon.source} · {icon.collection}</small>
                  </span>
                  <ArrowRight size={15} />
                </button>
              ))
            ) : (
              <p className="command-empty">没有找到匹配的图标</p>
            )}
          </div>
          <footer>
            <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
            <span><kbd>Enter</kbd> 打开</span>
            <span><kbd>Ctrl / ⌘ K</kbd> 命令</span>
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
