import type { IconItem, IconifySearchResponse } from "./types";

type SearchOptions = {
  query: string;
  prefix?: string;
  limit?: number;
  signal?: AbortSignal;
};

export async function searchIcons({
  query,
  prefix,
  limit = 96,
  signal,
}: SearchOptions): Promise<IconifySearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });
  if (prefix) params.set("prefix", prefix);

  const response = await fetch(`/api/icons/search?${params.toString()}`, {
    signal,
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? "搜索服务暂时不可用");
  }
  return response.json() as Promise<IconifySearchResponse>;
}

export function iconSvgUrl(iconifyId: string) {
  return `/api/icons/svg?icon=${encodeURIComponent(iconifyId)}`;
}

export async function fetchIconSvg(icon: IconItem) {
  if (icon.svg) return icon.svg;
  if (!icon.iconifyId) throw new Error("图标内容不可用");

  const response = await fetch(iconSvgUrl(icon.iconifyId));
  if (!response.ok) throw new Error("图标获取失败");
  return response.text();
}
