"use client";

import {
  Check,
  CheckSquare2,
  Copy,
  Heart,
  RotateCcw,
  Square,
} from "lucide-react";
import { sourceTone } from "@/lib/icons/catalog";
import type { IconItem, ViewMode } from "@/lib/icons/types";
import { IconArtwork } from "./icon-artwork";
import { useLibrary } from "./library-provider";

export function IconGrid({
  icons,
  mode,
}: {
  icons: IconItem[];
  mode: ViewMode;
}) {
  const {
    selectedIds,
    openIcon,
    toggleFavorite,
    toggleSelection,
    copySvg,
    restoreIcon,
  } = useLibrary();

  return (
    <div className={`icon-grid ${mode === "list" ? "list-mode" : ""}`}>
      {icons.map((icon) => {
        const selected = selectedIds.includes(icon.id);
        return (
          <article
            className={`icon-card ${selected ? "selected" : ""}`}
            data-tone={sourceTone(icon.source)}
            key={icon.id}
          >
            <button
              className="card-select"
              onClick={() => toggleSelection(icon.id)}
              aria-label={selected ? `取消选择 ${icon.name}` : `选择 ${icon.name}`}
              type="button"
            >
              {selected ? (
                <CheckSquare2 size={16} />
              ) : (
                <Square size={16} />
              )}
            </button>
            <button
              className="card-main"
              onClick={() => openIcon(icon.id)}
              type="button"
            >
              <span className="icon-stage">
                <IconArtwork item={icon} size={mode === "list" ? 30 : 42} />
              </span>
              <span className="card-copy">
                <strong>{icon.name}</strong>
                <small>{icon.iconifyId ?? "自定义 SVG"}</small>
              </span>
            </button>
            <div className="card-footer">
              <span className="source-chip" data-tone={sourceTone(icon.source)}>
                <i />
                {icon.source}
              </span>
              <div className="card-actions">
                {icon.trashed ? (
                  <button
                    onClick={() => restoreIcon(icon.id)}
                    aria-label={`恢复 ${icon.name}`}
                    data-tooltip="恢复"
                    type="button"
                  >
                    <RotateCcw size={15} />
                  </button>
                ) : (
                  <>
                    <button
                      className={icon.favorite ? "favorite" : ""}
                      onClick={() => toggleFavorite(icon.id)}
                      aria-label={icon.favorite ? "取消收藏" : "收藏"}
                      data-tooltip={icon.favorite ? "取消收藏" : "收藏"}
                      type="button"
                    >
                      <Heart
                        size={15}
                        fill={icon.favorite ? "currentColor" : "none"}
                      />
                    </button>
                    <button
                      onClick={() => copySvg(icon)}
                      aria-label="复制 SVG"
                      data-tooltip="复制 SVG"
                      type="button"
                    >
                      <Copy size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
            {selected && (
              <span className="selected-indicator" aria-hidden>
                <Check size={12} />
              </span>
            )}
          </article>
        );
      })}
    </div>
  );
}
