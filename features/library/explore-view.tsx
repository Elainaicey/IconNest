"use client";

import {
  Check,
  ExternalLink,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { searchIcons } from "@/lib/icons/api";
import {
  getIconName,
  getSourceLabel,
  INITIAL_EXPLORE_RESULTS,
  SOURCE_DEFINITIONS,
} from "@/lib/icons/catalog";
import type { IconItem } from "@/lib/icons/types";
import { IconArtwork } from "./icon-artwork";
import { useLibrary } from "./library-provider";

export function ExploreView() {
  const { icons, collections, addIcon, updateIcon, notify } = useLibrary();
  const [searchQuery, setSearchQuery] = useState("arrow");
  const [activePrefix, setActivePrefix] = useState("");
  const [results, setResults] = useState(INITIAL_EXPLORE_RESULTS);
  const [total, setTotal] = useState(INITIAL_EXPLORE_RESULTS.length);
  const [loading, setLoading] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  async function runSearch(event?: FormEvent, prefix = activePrefix) {
    event?.preventDefault();
    const keyword = searchQuery.trim();
    if (!keyword) {
      notify("请输入搜索关键词");
      return;
    }

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    try {
      const response = await searchIcons({
        query: keyword,
        prefix,
        limit: 96,
        signal: controller.signal,
      });
      setResults(response.icons);
      setTotal(response.total);
    } catch (error) {
      if (controller.signal.aborted) return;
      notify(error instanceof Error ? error.message : "搜索失败");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  function addExploreIcon(iconifyId: string) {
    const existing = icons.find((icon) => icon.iconifyId === iconifyId);
    if (existing) {
      if (existing.trashed) {
        updateIcon(existing.id, { trashed: false });
        notify("图标已从回收站恢复");
      } else {
        notify("这枚图标已经在库中");
      }
      return;
    }

    const item: IconItem = {
      id: `iconify-${iconifyId.replace(":", "-")}`,
      name: getIconName(iconifyId),
      iconifyId,
      source: getSourceLabel(iconifyId),
      tags: searchQuery.trim() ? [searchQuery.trim().toLowerCase()] : [],
      collection: collections[0] ?? "未分类",
      favorite: false,
      addedAt: Date.now(),
    };
    addIcon(item);
    notify("已添加到图标库");
  }

  return (
    <div className="workspace-page explore-page">
      <header className="page-header explore-header">
        <div>
          <span className="section-kicker">ICON DISCOVERY</span>
          <h1>探索图标</h1>
          <p>跨 5 个开源图标库统一搜索</p>
        </div>
        <a
          className="service-badge"
          href="https://iconify.design/"
          target="_blank"
          rel="noreferrer"
        >
          <ShieldCheck size={15} />
          Powered by Iconify
          <ExternalLink size={13} />
        </a>
      </header>

      <form className="explore-search" onSubmit={runSearch}>
        <Search size={19} />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="搜索 arrow、camera、home…"
          aria-label="搜索开源图标"
        />
        <button className="button button-solid" disabled={loading}>
          {loading ? "搜索中…" : "搜索"}
        </button>
      </form>

      <div className="source-tabs" role="tablist" aria-label="图标来源">
        {SOURCE_DEFINITIONS.map((source) => (
          <button
            key={source.label}
            className={activePrefix === source.prefix ? "active" : ""}
            data-tone={source.tone}
            role="tab"
            aria-selected={activePrefix === source.prefix}
            onClick={() => {
              setActivePrefix(source.prefix);
              void runSearch(undefined, source.prefix);
            }}
            type="button"
          >
            <span className="source-tab-mark">
              {source.prefix ? source.label.slice(0, 1) : <Sparkles size={15} />}
            </span>
            <span>
              <strong>{source.label}</strong>
              <small>{source.description}</small>
            </span>
            {activePrefix === source.prefix && <Check size={14} />}
          </button>
        ))}
      </div>

      <div className="results-header">
        <span>
          {loading
            ? "正在搜索…"
            : `${total.toLocaleString("zh-CN")} 个结果`}
        </span>
        <small>请遵守各图标库的许可协议</small>
      </div>

      <div className="explore-grid" aria-busy={loading}>
        {loading
          ? Array.from({ length: 18 }).map((_, index) => (
              <div className="explore-card skeleton" key={index} />
            ))
          : results.map((iconifyId) => {
              const existing = icons.find(
                (icon) => icon.iconifyId === iconifyId && !icon.trashed,
              );
              const source = getSourceLabel(iconifyId);
              return (
                <article
                  className="explore-card"
                  data-tone={
                    SOURCE_DEFINITIONS.find(
                      (definition) => definition.label === source,
                    )?.tone ?? "iris"
                  }
                  key={iconifyId}
                >
                  <span className="explore-source">{source}</span>
                  <div className="explore-art">
                    <IconArtwork
                      item={{ name: getIconName(iconifyId), iconifyId }}
                      size={40}
                    />
                  </div>
                  <strong title={getIconName(iconifyId)}>
                    {getIconName(iconifyId)}
                  </strong>
                  <small title={iconifyId}>{iconifyId}</small>
                  <button
                    className={existing ? "added" : ""}
                    onClick={() => addExploreIcon(iconifyId)}
                    aria-label={
                      existing
                        ? `${getIconName(iconifyId)} 已在图标库`
                        : `添加 ${getIconName(iconifyId)}`
                    }
                    data-tooltip={existing ? "已添加" : "添加到图标库"}
                    type="button"
                  >
                    {existing ? <Check size={15} /> : <Plus size={15} />}
                  </button>
                </article>
              );
            })}
      </div>

      {!loading && results.length === 0 && (
        <div className="empty-state compact">
          <Search size={25} />
          <h2>没有找到结果</h2>
          <p>尝试更短的英文关键词或切换图标来源。</p>
        </div>
      )}
    </div>
  );
}
