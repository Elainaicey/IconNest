"use client";

import {
  Check,
  CheckSquare2,
  Copy,
  Heart,
  RotateCcw,
  Square,
} from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import {
  resetInteractiveSurface,
  trackInteractiveSurface,
} from "@/components/ui/interactive-surface";
import { sourceTone } from "@/lib/icons/catalog";
import type { IconItem, ViewMode } from "@/lib/icons/types";
import { IconArtwork } from "./icon-artwork";

type IconCardProps = {
  icon: IconItem;
  mode: ViewMode;
  selected: boolean;
  onOpen: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleSelection: (id: string) => void;
  onCopy: (icon: IconItem) => Promise<void>;
  onRestore: (id: string) => void;
};

export const IconCard = memo(function IconCard({
  icon,
  mode,
  selected,
  onOpen,
  onToggleFavorite,
  onToggleSelection,
  onCopy,
  onRestore,
}: IconCardProps) {
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    },
    [],
  );

  async function handleCopy() {
    await onCopy(icon);
    setCopied(true);
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <article
      className={`icon-card ${selected ? "selected" : ""}`}
      data-tone={sourceTone(icon.source)}
      data-interactive-surface="true"
      onPointerMove={trackInteractiveSurface}
      onPointerLeave={resetInteractiveSurface}
    >
      <span className="card-sheen" aria-hidden="true" />
      <button
        className="card-select"
        onClick={() => onToggleSelection(icon.id)}
        aria-label={selected ? `取消选择 ${icon.name}` : `选择 ${icon.name}`}
        aria-pressed={selected}
        type="button"
      >
        {selected ? <CheckSquare2 size={17} /> : <Square size={17} />}
      </button>
      <button className="card-main" onClick={() => onOpen(icon.id)} type="button">
        <span className="icon-stage">
          <span className="icon-stage-orbit" aria-hidden="true" />
          <IconArtwork item={icon} size={mode === "list" ? 30 : 44} />
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
              onClick={() => onRestore(icon.id)}
              aria-label={`恢复 ${icon.name}`}
              data-tooltip="恢复"
              type="button"
            >
              <RotateCcw size={16} />
            </button>
          ) : (
            <>
              <button
                className={icon.favorite ? "favorite" : ""}
                onClick={() => onToggleFavorite(icon.id)}
                aria-label={icon.favorite ? "取消收藏" : "收藏"}
                aria-pressed={icon.favorite}
                data-tooltip={icon.favorite ? "取消收藏" : "收藏"}
                type="button"
              >
                <Heart
                  size={16}
                  fill={icon.favorite ? "currentColor" : "none"}
                />
              </button>
              <button
                className={copied ? "copied" : ""}
                onClick={handleCopy}
                aria-label={copied ? "SVG 已复制" : "复制 SVG"}
                data-tooltip={copied ? "已复制" : "复制 SVG"}
                type="button"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </>
          )}
        </div>
      </div>
      {selected && (
        <span className="selected-indicator" aria-hidden="true">
          <Check size={12} />
        </span>
      )}
    </article>
  );
});
