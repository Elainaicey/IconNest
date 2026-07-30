"use client";

import { FolderPlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLibrary } from "./library-provider";

export function CollectionDialog() {
  const {
    createCollectionOpen,
    setCreateCollectionOpen,
    createCollection,
  } = useLibrary();
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!createCollectionOpen) return;
    const timeout = window.setTimeout(() => {
      setName("");
      inputRef.current?.focus();
    }, 20);
    return () => window.clearTimeout(timeout);
  }, [createCollectionOpen]);

  if (!createCollectionOpen) return null;

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          setCreateCollectionOpen(false);
        }
      }}
    >
      <form
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-dialog-title"
        onSubmit={(event) => {
          event.preventDefault();
          createCollection(name);
        }}
      >
        <div className="dialog-icon">
          <FolderPlus size={20} />
        </div>
        <div className="dialog-heading">
          <div>
            <h2 id="collection-dialog-title">新建集合</h2>
            <p>用清晰的集合整理相关图标。</p>
          </div>
          <button
            className="dialog-close"
            onClick={() => setCreateCollectionOpen(false)}
            aria-label="关闭"
            type="button"
          >
            <X size={17} />
          </button>
        </div>
        <label className="field-label" htmlFor="collection-name">
          集合名称
        </label>
        <input
          id="collection-name"
          ref={inputRef}
          className="text-field"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="例如：营销活动"
          maxLength={32}
        />
        <div className="dialog-actions">
          <button
            className="button button-ghost"
            onClick={() => setCreateCollectionOpen(false)}
            type="button"
          >
            取消
          </button>
          <button className="button button-solid" disabled={!name.trim()}>
            创建集合
          </button>
        </div>
      </form>
    </div>
  );
}
