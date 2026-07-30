"use client";

import { Menu, Moon, Search, Sun, Upload, X } from "lucide-react";
import { useLibrary } from "./library-provider";
import { IconButton } from "./icon-button";

export function Topbar() {
  const {
    query,
    setQuery,
    setMobileMenuOpen,
    theme,
    toggleTheme,
    uploadInputRef,
  } = useLibrary();

  return (
    <header className="topbar">
      <IconButton
        className="menu-button"
        label="打开菜单"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu size={19} />
      </IconButton>

      <label className="global-search">
        <Search size={17} />
        <input
          data-global-search
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索名称、来源、标签或集合"
          aria-label="搜索图标库"
        />
        {query ? (
          <button
            onClick={() => setQuery("")}
            aria-label="清空搜索"
            type="button"
          >
            <X size={15} />
          </button>
        ) : (
          <kbd>⌘ K</kbd>
        )}
      </label>

      <div className="topbar-meta">
        <span className="sync-label">
          <i />
          本地自动保存
        </span>
        <IconButton
          label={theme === "light" ? "切换到深色模式" : "切换到浅色模式"}
          onClick={toggleTheme}
        >
          {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
        </IconButton>
        <button
          className="button button-solid top-upload"
          onClick={() => uploadInputRef.current?.click()}
          type="button"
        >
          <Upload size={15} />
          上传图标
        </button>
      </div>
    </header>
  );
}
