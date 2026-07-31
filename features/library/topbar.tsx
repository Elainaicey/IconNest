"use client";

import { Menu, Moon, PanelLeftClose, Search, Sun, Upload, X } from "lucide-react";
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
    storageState,
    setCommandMenuOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
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
      <IconButton
        className="sidebar-toggle"
        label={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        <PanelLeftClose size={18} />
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
          <button
            className="search-shortcut"
            onClick={(event) => {
              event.preventDefault();
              setCommandMenuOpen(true);
            }}
            aria-label="打开快捷命令"
            type="button"
          >
            <kbd>⌘ K</kbd>
          </button>
        )}
      </label>

      <div className="topbar-meta">
        <span className={`sync-label state-${storageState}`}>
          <i />
          {storageState === "loading"
            ? "读取数据"
            : storageState === "saving"
              ? "正在保存"
              : storageState === "error"
                ? "保存异常"
                : "本地已保存"}
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
