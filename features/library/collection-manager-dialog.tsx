"use client";

import { useState } from "react";
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

  if (!collectionManagerOpen) return null;

  return (
    <div className="modal-layer" role="presentation" onMouseDown={() => setCollectionManagerOpen(false)}>
      <section
        className="dialog collection-manager acrylic-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-collections-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <span className="dialog-icon"><FolderCog size={19} /></span>
          <div><h2 id="manage-collections-title">管理集合</h2><p>重命名或整理你的图标分组</p></div>
          <button className="icon-button" onClick={() => setCollectionManagerOpen(false)} aria-label="关闭" type="button"><X size={17} /></button>
        </header>
        <div className="collection-manager-list">
          {collections.map((collection) => {
            const count = icons.filter((icon) => !icon.trashed && icon.collection === collection).length;
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
      </section>
    </div>
  );
}
