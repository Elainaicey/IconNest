import type { WorkspaceRoute } from "@/lib/icons/types";
import { ExploreView } from "./explore-view";
import { LibraryView } from "./library-view";

export function WorkspaceView({ route }: { route: WorkspaceRoute }) {
  if (route.kind === "explore") return <ExploreView />;
  return <LibraryView route={route} />;
}
