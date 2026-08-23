"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  Braces,
  Code2,
  Copy,
  Download,
  FlipHorizontal2,
  Heart,
  ImageDown,
  RotateCw,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { IconArtwork } from "./icon-artwork";
import { IconButton } from "./icon-button";
import { useLibrary } from "./library-provider";

export function DetailDrawer() {
  const {
    selectedIcon,
    setSelectedIconId,
    collections,
    updateIcon,
    toggleFavorite,
    deleteIcon,
    notify,
    copySvg,
    copyReact,
    copyCss,
    copyHtml,
    downloadSvg,
    downloadPng,
  } = useLibrary();
  const [previewColor, setPreviewColor] = useState("#3e3eae");
  const [previewSize, setPreviewSize] = useState(96);
  const [rotation, setRotation] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const selectedIconId = selectedIcon?.id;

  useEffect(() => {
    if (!selectedIconId) return;
    const timeout = window.setTimeout(() => {
      setPreviewColor("#3e3eae");
      setPreviewSize(96);
      setRotation(0);
      setFlipped(false);
      setTagInput("");
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [selectedIconId]);

  function addTag() {
    if (!selectedIcon) return;
    const tag = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (!tag || selectedIcon.tags.includes(tag)) {
      setTagInput("");
      return;
    }
    updateIcon(selectedIcon.id, { tags: [...selectedIcon.tags, tag] });
    setTagInput("");
  }

  return (
    <DialogPrimitive.Root
      open={Boolean(selectedIcon)}
      onOpenChange={(open) => {
        if (!open) setSelectedIconId(null);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="detail-backdrop" />
        {selectedIcon && (
          <DialogPrimitive.Content
            className="detail-drawer"
            aria-describedby="detail-description"
          >
            <DialogPrimitive.Description
              className="visually-hidden"
              id="detail-description"
            >
              预览、整理并导出当前图标
            </DialogPrimitive.Description>
            <header className="detail-header">
              <div>
                <span className="detail-eyebrow">图标详情</span>
                <DialogPrimitive.Title asChild>
                  <strong>{selectedIcon.iconifyId ?? "自定义 SVG"}</strong>
                </DialogPrimitive.Title>
              </div>
              <DialogPrimitive.Close asChild>
                <IconButton label="关闭详情">
                  <X size={18} />
                </IconButton>
              </DialogPrimitive.Close>
            </header>

            <div className="detail-scroll">
              <section className="detail-preview" aria-label="图标预览">
                <div className="preview-grid" />
                <span
                  className="detail-artwork"
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${
                      flipped ? -1 : 1
                    })`,
                  }}
                >
                  <IconArtwork
                    item={selectedIcon}
                    size={previewSize}
                    color={previewColor}
                  />
                </span>
                <span className="preview-size-label">{previewSize}px</span>
              </section>

              <div className="preview-toolbar">
                <label>
                  <span>预览尺寸 <em>仅预览</em></span>
                  <input
                    type="range"
                    min="40"
                    max="144"
                    step="4"
                    value={previewSize}
                    onChange={(event) =>
                      setPreviewSize(Number(event.target.value))
                    }
                  />
                </label>
                <IconButton
                  className={rotation ? "active" : ""}
                  label="旋转 90 度"
                  onClick={() => setRotation((current) => (current + 90) % 360)}
                >
                  <RotateCw size={16} />
                </IconButton>
                <IconButton
                  className={flipped ? "active" : ""}
                  label="水平翻转"
                  onClick={() => setFlipped((current) => !current)}
                >
                  <FlipHorizontal2 size={16} />
                </IconButton>
              </div>

              <section className="detail-section">
                <div className="detail-title-row">
                  <input
                    className="detail-name"
                    value={selectedIcon.name}
                    onChange={(event) =>
                      updateIcon(selectedIcon.id, { name: event.target.value })
                    }
                    aria-label="图标名称"
                  />
                  <IconButton
                    className={selectedIcon.favorite ? "favorite" : ""}
                    label={selectedIcon.favorite ? "取消收藏" : "加入收藏"}
                    onClick={() => toggleFavorite(selectedIcon.id)}
                  >
                    <Heart
                      size={18}
                      fill={selectedIcon.favorite ? "currentColor" : "none"}
                    />
                  </IconButton>
                </div>

                <div className="detail-fields">
                  <label>
                    <span>预览颜色</span>
                    <span className="color-field">
                      <input
                        type="color"
                        value={previewColor}
                        onChange={(event) => setPreviewColor(event.target.value)}
                        aria-label="选择预览颜色"
                      />
                      <code>{previewColor.toUpperCase()}</code>
                    </span>
                  </label>
                  <label>
                    <span>所属集合</span>
                    <select
                      value={selectedIcon.collection}
                      onChange={(event) =>
                        updateIcon(selectedIcon.id, {
                          collection: event.target.value,
                        })
                      }
                    >
                      {collections.map((collection) => (
                        <option key={collection}>{collection}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="tag-editor">
                  <span className="field-label">
                    <Tag size={14} />
                    标签
                  </span>
                  <div className="tag-list">
                    {selectedIcon.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() =>
                          updateIcon(selectedIcon.id, {
                            tags: selectedIcon.tags.filter(
                              (currentTag) => currentTag !== tag,
                            ),
                          })
                        }
                        title="移除标签"
                        type="button"
                      >
                        #{tag}
                        <X size={11} />
                      </button>
                    ))}
                    <input
                      value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addTag();
                        }
                      }}
                      onBlur={addTag}
                      placeholder="+ 添加"
                      aria-label="添加标签"
                    />
                  </div>
                </div>
              </section>

              <section className="detail-section">
                <div className="section-label">交付格式</div>
                <div className="delivery-grid">
                  <button onClick={() => copySvg(selectedIcon)} type="button">
                    <Copy size={17} />
                    <span>
                      <strong>复制 SVG</strong>
                      <small>原始矢量</small>
                    </span>
                  </button>
                  <button onClick={() => copyReact(selectedIcon)} type="button">
                    <Braces size={17} />
                    <span>
                      <strong>复制 React</strong>
                      <small>组件代码</small>
                    </span>
                  </button>
                  <button onClick={() => copyCss(selectedIcon)} type="button">
                    <Code2 size={17} />
                    <span>
                      <strong>复制 CSS</strong>
                      <small>Mask 样式</small>
                    </span>
                  </button>
                  <button onClick={() => copyHtml(selectedIcon)} type="button">
                    <Code2 size={17} />
                    <span>
                      <strong>复制 HTML</strong>
                      <small>内联代码</small>
                    </span>
                  </button>
                </div>
                <div className="download-row">
                  <button className="button button-soft detail-download" onClick={() => downloadSvg(selectedIcon)} type="button">
                    <Download size={16} /> 下载 SVG
                  </button>
                  <button className="button button-soft detail-download" onClick={() => downloadPng(selectedIcon, 512)} type="button">
                    <ImageDown size={16} /> 下载 PNG
                  </button>
                </div>
              </section>

              <section className="source-row">
                <span className="source-avatar">
                  {selectedIcon.source.slice(0, 1)}
                </span>
                <span>
                  <small>图标来源</small>
                  <strong>{selectedIcon.source}</strong>
                </span>
                {selectedIcon.iconifyId && (
                  <a
                    href={`https://icon-sets.iconify.design/${
                      selectedIcon.iconifyId.split(":")[0]
                    }/${selectedIcon.iconifyId.split(":")[1]}/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    原始页面
                    <ArrowUpRight size={14} />
                  </a>
                )}
              </section>

              <button
                className="danger-action"
                onClick={() => {
                  if (selectedIcon.trashed) {
                    if (window.confirm("永久删除这枚图标？此操作无法撤销。")) {
                      deleteIcon(selectedIcon.id);
                    }
                  } else {
                    updateIcon(selectedIcon.id, { trashed: true });
                    setSelectedIconId(null);
                    notify("图标已移至回收站");
                  }
                }}
                type="button"
              >
                <Trash2 size={15} />
                {selectedIcon.trashed ? "永久删除" : "移至回收站"}
              </button>
            </div>
          </DialogPrimitive.Content>
        )}
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
