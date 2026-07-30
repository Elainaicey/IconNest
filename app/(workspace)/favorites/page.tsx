import type { Metadata } from "next";
import { WorkspaceView } from "@/features/library/workspace-view";

export const metadata: Metadata = {
  title: "我的收藏",
};

export default function FavoritesPage() {
  return <WorkspaceView route={{ kind: "favorites" }} />;
}
