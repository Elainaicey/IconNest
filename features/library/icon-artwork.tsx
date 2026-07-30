"use client";

import type { CSSProperties } from "react";
import { iconSvgUrl } from "@/lib/icons/api";
import { svgDataUrl } from "@/lib/icons/svg";
import type { IconItem } from "@/lib/icons/types";

export function IconArtwork({
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
        className="icon-artwork icon-artwork-upload"
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          backgroundImage: `url("${svgDataUrl(item.svg)}")`,
        }}
      />
    );
  }

  const url = `url("${iconSvgUrl(item.iconifyId ?? "lucide:circle-help")}")`;
  const style: CSSProperties = {
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
    backgroundColor: color,
  };

  return <span className="icon-artwork icon-artwork-mask" aria-hidden style={style} />;
}
