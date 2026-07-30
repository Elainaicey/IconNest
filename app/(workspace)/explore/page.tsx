import type { Metadata } from "next";
import { WorkspaceView } from "@/features/library/workspace-view";

export const metadata: Metadata = {
  title: "探索图标",
};

export default function ExplorePage() {
  return <WorkspaceView route={{ kind: "explore" }} />;
}
