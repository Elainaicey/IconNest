"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useMemo, useState } from "react";
import { FolderCog, Pencil, Trash2, X } from "lucide-react";
import { useLibrary } from "./library-provider";

export function CollectionManagerDialog() {
  const {
    collectionManagerOpen,
    setCollectionManagerOpen,
    collections,
    icons,
    renameCollection,
    deleteCollection,
  } = useLibrary();
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const collectionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const icon of icons) {
      if (!icon.trashed) {
        counts.set(icon.collection, (counts.get(icon.collection) ?? 0) + 1);
      }
    }
    return counts;
  }, [icons]);

  return (
    <DialogPrimitive.Root open={collectionManagerOpen} onOpenChange={setCollectionManagerOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="modal-layer" />
        <DialogPrimitive.Content className="dialog collection-manager acrylic-panel">
        <header>
          <span className="dialog-icon"><FolderCog size={19} /></span>
          <div>
            <DialogPrimitive.Title id="manage-collections-title">管理集合</DialogPrimitive.Title>
            <DialogPrimitive.Description>重命名或整理你的图标分组</DialogPrimitive.Description>
          </div>
          <DialogPrimitive.Close asChild>
            <button className="icon-button" aria-label="关闭" type="button"><X size={17} /></button>
          </DialogPrimitive.Close>
        </header>
        <div className="collection-manager-list">
          {collections.map((collection) => {
            const count = collectionCounts.get(collection) ?? 0;
            return (
              <div className="collection-manager-row" key={collection}>
                {editing === collection ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (renameCollection(collection, name)) setEditing(null);
                    }}
                  >
                    <input autoFocus value={name} onChange={(event) => setName(event.target.value)} maxLength={32} />
                    <button className="button button-solid" type="submit">保存</button>
                    <button className="button button-ghost" onClick={() => setEditing(null)} type="button">取消</button>
                  </form>
                ) : (
                  <>
                    <span className="collection-manager-name"><i /><span><strong>{collection}</strong><small>{count} 枚图标</small></span></span>
                    <div>
                      <button onClick={() => { setEditing(collection); setName(collection); }} aria-label={`重命名${collection}`} type="button"><Pencil size={15} /></button>
                      <button
                        className="danger"
                        onClick={() => {
                          if (window.confirm(`确定移除「${collection}」吗？其中图标会安全转移到其他集合。`)) deleteCollection(collection);
                        }}
                        aria-label={`删除${collection}`}
                        type="button"
                      ><Trash2 size={15} /></button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
