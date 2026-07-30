import type { IconItem, SourceDefinition } from "./types";

const SEED_TIME = Date.UTC(2026, 6, 30, 8, 0, 0);

export const DEFAULT_COLLECTIONS = ["品牌资产", "产品界面", "社交媒体"];

export const SOURCE_DEFINITIONS: SourceDefinition[] = [
  {
    label: "全部来源",
    prefix: "",
    description: "跨图标库搜索",
    tone: "iris",
  },
  {
    label: "Lucide",
    prefix: "lucide",
    description: "简洁线性",
    tone: "ruby",
  },
  {
    label: "Tabler",
    prefix: "tabler",
    description: "精致清晰",
    tone: "sky",
  },
  {
    label: "Phosphor",
    prefix: "ph",
    description: "灵活多风格",
    tone: "iris",
  },
  {
    label: "Remix",
    prefix: "ri",
    description: "界面友好",
    tone: "teal",
  },
  {
    label: "Solar",
    prefix: "solar",
    description: "圆润现代",
    tone: "amber",
  },
];

export const SEED_LIBRARY: IconItem[] = [
  {
    id: "seed-sparkles",
    name: "Sparkles",
    iconifyId: "lucide:sparkles",
    source: "Lucide",
    tags: ["magic", "ai"],
    collection: "品牌资产",
    favorite: true,
    addedAt: SEED_TIME - 3_600_000,
    viewedAt: SEED_TIME - 240_000,
  },
  {
    id: "seed-orbit",
    name: "Orbit",
    iconifyId: "lucide:orbit",
    source: "Lucide",
    tags: ["space", "brand"],
    collection: "品牌资产",
    favorite: true,
    addedAt: SEED_TIME - 7_200_000,
  },
  {
    id: "seed-command",
    name: "Command",
    iconifyId: "tabler:command",
    source: "Tabler",
    tags: ["keyboard", "shortcut"],
    collection: "产品界面",
    favorite: false,
    addedAt: SEED_TIME - 8_400_000,
  },
  {
    id: "seed-heart",
    name: "Heart",
    iconifyId: "ph:heart",
    source: "Phosphor",
    tags: ["like", "social"],
    collection: "社交媒体",
    favorite: true,
    addedAt: SEED_TIME - 10_800_000,
  },
  {
    id: "seed-bell",
    name: "Notification",
    iconifyId: "solar:bell-linear",
    source: "Solar",
    tags: ["alert", "ui"],
    collection: "产品界面",
    favorite: false,
    addedAt: SEED_TIME - 14_400_000,
  },
  {
    id: "seed-gallery",
    name: "Gallery",
    iconifyId: "ri:gallery-line",
    source: "Remix",
    tags: ["image", "media"],
    collection: "社交媒体",
    favorite: false,
    addedAt: SEED_TIME - 18_000_000,
  },
  {
    id: "seed-cursor",
    name: "Cursor Click",
    iconifyId: "tabler:pointer",
    source: "Tabler",
    tags: ["pointer", "action"],
    collection: "产品界面",
    favorite: false,
    addedAt: SEED_TIME - 21_600_000,
  },
  {
    id: "seed-paper-plane",
    name: "Send",
    iconifyId: "ph:paper-plane-tilt",
    source: "Phosphor",
    tags: ["send", "message"],
    collection: "社交媒体",
    favorite: false,
    addedAt: SEED_TIME - 25_200_000,
  },
  {
    id: "seed-badge",
    name: "Badge",
    iconifyId: "lucide:badge-check",
    source: "Lucide",
    tags: ["verified", "trust"],
    collection: "品牌资产",
    favorite: false,
    addedAt: SEED_TIME - 28_800_000,
  },
  {
    id: "seed-layers",
    name: "Layers",
    iconifyId: "solar:layers-linear",
    source: "Solar",
    tags: ["stack", "design"],
    collection: "产品界面",
    favorite: false,
    addedAt: SEED_TIME - 32_400_000,
  },
  {
    id: "seed-camera",
    name: "Camera",
    iconifyId: "ri:camera-3-line",
    source: "Remix",
    tags: ["photo", "social"],
    collection: "社交媒体",
    favorite: false,
    addedAt: SEED_TIME - 36_000_000,
  },
  {
    id: "seed-shapes",
    name: "Geometry",
    iconifyId: "tabler:geometry",
    source: "Tabler",
    tags: ["design", "brand"],
    collection: "品牌资产",
    favorite: true,
    addedAt: SEED_TIME - 43_200_000,
  },
];

export const INITIAL_EXPLORE_RESULTS = [
  "lucide:arrow-up-right",
  "tabler:arrow-narrow-right",
  "ph:arrow-circle-up-right",
  "ri:arrow-right-up-line",
  "solar:arrow-right-up-linear",
  "lucide:move-up-right",
  "tabler:arrows-diagonal",
  "ph:cursor-click",
  "ri:corner-right-up-line",
  "solar:round-arrow-right-up-linear",
];

const SOURCE_LABELS: Record<string, string> = {
  lucide: "Lucide",
  tabler: "Tabler",
  ph: "Phosphor",
  ri: "Remix",
  solar: "Solar",
};

export function getSourceLabel(iconifyId: string) {
  const prefix = iconifyId.split(":")[0];
  return SOURCE_LABELS[prefix] ?? prefix.toUpperCase();
}

export function getIconName(iconifyId: string) {
  const raw = iconifyId.split(":")[1] ?? iconifyId;
  return raw
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function sourceTone(source: string) {
  if (source === "Lucide") return "ruby";
  if (source === "Tabler") return "sky";
  if (source === "Phosphor") return "iris";
  if (source === "Remix") return "teal";
  if (source === "Solar") return "amber";
  if (source === "本地上传") return "jade";
  return "iris";
}
