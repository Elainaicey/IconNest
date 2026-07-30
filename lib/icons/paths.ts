import type { WorkspaceRoute } from "./types";

export const workspacePaths = {
  library: "/library",
  explore: "/explore",
  favorites: "/favorites",
  recent: "/recent",
  trash: "/trash",
  collection(name: string) {
    return `/collections/${encodeURIComponent(name)}`;
  },
} as const;

export function routeTitle(route: WorkspaceRoute) {
  if (route.kind === "explore") return "探索图标";
  if (route.kind === "favorites") return "我的收藏";
  if (route.kind === "recent") return "最近浏览";
  if (route.kind === "trash") return "回收站";
  if (route.kind === "collection") return route.collection;
  return "图标库";
}

export function routePath(route: WorkspaceRoute) {
  if (route.kind === "collection") {
    return workspacePaths.collection(route.collection);
  }
  return workspacePaths[route.kind];
}
