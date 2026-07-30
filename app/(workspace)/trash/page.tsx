import type { Metadata } from "next";
import { WorkspaceView } from "@/features/library/workspace-view";

export const metadata: Metadata = {
  title: "回收站",
};

export default function TrashPage() {
  return <WorkspaceView route={{ kind: "trash" }} />;
}
