import type { Metadata } from "next";
import { WorkspaceView } from "@/features/library/workspace-view";

export const metadata: Metadata = {
  title: "图标库",
};

export default function LibraryPage() {
  return <WorkspaceView route={{ kind: "library" }} />;
}
