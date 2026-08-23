"use client";

import {
  Check,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  resetInteractiveSurface,
  trackInteractiveSurface,
} from "@/components/ui/interactive-surface";
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
  const [errorMessage, setErrorMessage] = useState("");
  const requestRef = useRef<AbortController | null>(null);
  const activeIconifyIds = useMemo(
    () => new Set(icons.filter((icon) => !icon.trashed).map((icon) => icon.iconifyId)),
    [icons],
  );

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
    setErrorMessage("");
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
      const message = error instanceof Error ? error.message : "搜索失败";
      setErrorMessage(message);
      notify(message);
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
      <section className="explore-hero" aria-labelledby="explore-title">
        <span className="explore-hero-glow" aria-hidden="true" />
        <header className="page-header explore-header">
          <div>
            <span className="section-kicker">ICON DISCOVERY</span>
            <h1 id="explore-title">探索下一枚好图标</h1>
            <p>跨 5 个优秀开源图标库统一检索，找到后直接收入你的工作区。</p>
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

        <form className="explore-search" onSubmit={runSearch} role="search">
          <span className="explore-search-icon"><Search size={20} /></span>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="试试 arrow、camera、home…"
            aria-label="搜索开源图标"
          />
          <span className="explore-search-hint">英文关键词效果更佳</span>
          <button className="button button-solid" disabled={loading} type="submit">
            {loading ? "搜索中…" : "开始搜索"}
          </button>
        </form>
      </section>

      <div className="source-tabs" role="group" aria-label="按图标来源筛选">
        {SOURCE_DEFINITIONS.map((source) => (
          <button
            key={source.label}
            className={activePrefix === source.prefix ? "active" : ""}
            data-tone={source.tone}
            aria-pressed={activePrefix === source.prefix}
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

      {errorMessage && (
        <div className="explore-error" role="alert">
          <span>{errorMessage}</span>
          <button onClick={() => void runSearch()} type="button">
            <RefreshCw size={14} /> 重试
          </button>
        </div>
      )}

      <div className="results-header" aria-live="polite">
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
              const existing = activeIconifyIds.has(iconifyId);
              const source = getSourceLabel(iconifyId);
              return (
                <article
                  className="explore-card"
                  data-tone={
                    SOURCE_DEFINITIONS.find(
                      (definition) => definition.label === source,
                    )?.tone ?? "iris"
                  }
                  data-interactive-surface="true"
                  onPointerMove={trackInteractiveSurface}
                  onPointerLeave={resetInteractiveSurface}
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
