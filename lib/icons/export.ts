import { strToU8, zipSync } from "fflate";
import { fetchIconSvg } from "./api";
import { downloadBlob, sanitizeSvg } from "./svg";
import type { IconItem } from "./types";

function safeFilename(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
      .replace(/^-+|-+$/g, "") || "icon"
  );
}

export async function exportIconsZip(icons: IconItem[]) {
  const entries: Record<string, Uint8Array> = {};
  const usedNames = new Set<string>();
  const manifest = [];

  for (const icon of icons) {
    const svg = sanitizeSvg(await fetchIconSvg(icon));
    const stem = safeFilename(icon.name);
    let filename = `${stem}.svg`;
    let index = 2;
    while (usedNames.has(filename)) filename = `${stem}-${index++}.svg`;
    usedNames.add(filename);
    entries[`icons/${filename}`] = strToU8(svg);
    manifest.push({
      file: filename,
      name: icon.name,
      source: icon.source,
      collection: icon.collection,
      tags: icon.tags,
    });
  }

  entries["manifest.json"] = strToU8(
    JSON.stringify(
      {
        app: "IconNest",
        version: 1,
        exportedAt: new Date().toISOString(),
        icons: manifest,
      },
      null,
      2,
    ),
  );

  downloadBlob(
    new Blob([zipSync(entries, { level: 6 })], { type: "application/zip" }),
    `iconnest-icons-${new Date().toISOString().slice(0, 10)}.zip`,
  );
}

export async function downloadIconPng(icon: IconItem, size = 512) {
  const svg = sanitizeSvg(await fetchIconSvg(icon));
  const source = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = source;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("当前浏览器无法生成 PNG");
    context.drawImage(image, 0, 0, size, size);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("PNG 生成失败"))),
        "image/png",
      ),
    );
    downloadBlob(blob, `${safeFilename(icon.name)}-${size}.png`);
  } finally {
    URL.revokeObjectURL(source);
  }
}
