"use client";

import { useMemo } from "react";
import type { IconItem, ViewMode } from "@/lib/icons/types";
import { IconCard } from "./icon-card";
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
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <div className={`icon-grid ${mode === "list" ? "list-mode" : ""}`}>
      {icons.map((icon) => (
        <IconCard
          key={icon.id}
          icon={icon}
          mode={mode}
          selected={selectedIdSet.has(icon.id)}
          onOpen={openIcon}
          onToggleFavorite={toggleFavorite}
          onToggleSelection={toggleSelection}
          onCopy={copySvg}
          onRestore={restoreIcon}
        />
      ))}
    </div>
  );
}
