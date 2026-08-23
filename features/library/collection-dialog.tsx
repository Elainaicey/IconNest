"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { FolderPlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { useLibrary } from "./library-provider";

export function CollectionDialog() {
  const {
    createCollectionOpen,
    setCreateCollectionOpen,
    createCollection,
  } = useLibrary();
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <DialogPrimitive.Root
      open={createCollectionOpen}
      onOpenChange={(open) => {
        setCreateCollectionOpen(open);
        if (open) setName("");
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-backdrop" />
        <DialogPrimitive.Content
          className="dialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          asChild
        >
          <form
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
                <DialogPrimitive.Title id="collection-dialog-title">
                  新建集合
                </DialogPrimitive.Title>
                <DialogPrimitive.Description>
                  用清晰的集合整理相关图标。
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close asChild>
                <button className="dialog-close" aria-label="关闭" type="button">
                  <X size={17} />
                </button>
              </DialogPrimitive.Close>
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
              <DialogPrimitive.Close asChild>
                <button className="button button-ghost" type="button">取消</button>
              </DialogPrimitive.Close>
              <button className="button button-solid" disabled={!name.trim()}>
                创建集合
              </button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
