import type { Metadata } from "next";
import { WorkspaceView } from "@/features/library/workspace-view";

export const metadata: Metadata = {
  title: "最近浏览",
};

export default function RecentPage() {
  return <WorkspaceView route={{ kind: "recent" }} />;
}
