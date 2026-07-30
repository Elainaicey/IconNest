import type { Metadata } from "next";
import { WorkspaceView } from "@/features/library/workspace-view";

type CollectionPageProps = {
  params: Promise<{ collection: string }>;
};

function collectionName(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { collection } = await params;
  return { title: collectionName(collection) };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collection } = await params;
  return (
    <WorkspaceView
      route={{ kind: "collection", collection: collectionName(collection) }}
    />
  );
}
