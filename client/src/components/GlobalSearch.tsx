// Cross-content search modal — Cmd+K (Ctrl+K) opens a global search across
// every searchable surface on the hub: pages, films, blog posts, lessons,
// ecosystem pillars, comparisons, reels, creatives.
//
// Built on a static index (films/lessons/pillars/comparisons/pages/creatives
// bundled at build time) plus a runtime tRPC fetch for blog posts + reels.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ArrowRight, Hash } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  STATIC_SEARCH_INDEX,
  searchAll,
  groupResults,
  type SearchResult,
} from "@/lib/searchIndex";

interface Props {
  open: boolean;
  onClose: () => void;
}

function slugFromReelUrl(directUrl: string): string {
  try {
    const u = new URL(directUrl);
    const m = u.pathname.match(/\/reels\/([a-z0-9-]+)\.mp4$/i);
    return m ? m[1] : "";
  } catch {
    return "";
  }
}

export default function GlobalSearch({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  // Pull live blog posts + reels from tRPC and merge into the search index
  const { data: blogPosts } = trpc.content.blogPosts.useQuery(undefined, {
    enabled: open,
  });
  const { data: videos } = trpc.content.videos.useQuery(undefined, {
    enabled: open,
  });

  const fullIndex = useMemo(() => {
    const blogResults: SearchResult[] = (blogPosts ?? []).map((p: any) => ({
      id: `blog:${p.slug}`,
      type: "blog",
      title: p.title,
      description: (p.excerpt || "").slice(0, 140),
      href: `/blog/${p.slug}`,
      emoji: "📖",
      searchBlob:
        `${p.title} ${p.excerpt || ""} ${(p.content || "").slice(0, 2000)}`.toLowerCase(),
    }));
    const reelResults: SearchResult[] = (videos ?? [])
      .filter(
        (v: any) => v.directUrl && !v.youtubeUrl && v.category !== "cinematic"
      )
      .map((v: any) => {
        const slug = slugFromReelUrl(v.directUrl) || `reel-${v.id}`;
        return {
          id: `reel:${slug}`,
          type: "reel" as const,
          title: v.title,
          description: "Short reel",
          href: `/reels/${slug}`,
          emoji: "▸",
          searchBlob: `${v.title} reel video short`.toLowerCase(),
        };
      });
    return [...STATIC_SEARCH_INDEX, ...blogResults, ...reelResults];
  }, [blogPosts, videos]);

  const results = useMemo(
    () => searchAll(fullIndex, query, 30),
    [fullIndex, query]
  );
  const grouped = useMemo(() => groupResults(results), [results]);
  const flatResults = useMemo(() => grouped.flatMap(g => g.items), [grouped]);

  // Reset focus on open + autofocus input
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      // Wait one tick for animation, then focus
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Keyboard: Esc to close, ↑↓ to navigate, Enter to select
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx(i => Math.min(flatResults.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx(i => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const r = flatResults[activeIdx];
        if (r) {
          navigate(r.href);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [open, flatResults, activeIdx, navigate, onClose]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-start justify-center pt-16 md:pt-24 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: -10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "white" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div
              className="flex items-center gap-3 px-5 py-4 border-b"
              style={{ borderColor: "rgba(15,23,42,0.06)" }}
            >
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search films, blog, lessons, ecosystem, creatives..."
                className="flex-1 outline-none text-base text-slate-900 placeholder:text-slate-400 bg-transparent"
                aria-label="Search the hub"
              />
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-100">
                Esc
              </kbd>
              <button
                onClick={onClose}
                className="md:hidden p-3 rounded-full hover:bg-slate-100"
                aria-label="Close search"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!query && (
                <div className="p-8 text-center">
                  <Hash className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm text-slate-500">
                    Type to search across films, blog posts, lessons, ecosystem
                    pillars, comparisons, reels, and creatives.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                    {[
                      "security",
                      "yield",
                      "stablecoin",
                      "ponzi",
                      "renounced",
                      "compounding",
                    ].map(s => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query && results.length === 0 && (
                <div className="p-8 text-center">
                  <Search className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm text-slate-500">
                    No results for "
                    <span className="font-mono text-slate-700">{query}</span>"
                  </p>
                </div>
              )}

              {grouped.map(group => {
                let runningIndex = grouped
                  .filter(g => groupOrderBefore(g.type, group.type))
                  .reduce((sum, g) => sum + g.items.length, 0);
                return (
                  <div key={group.type} className="px-2 py-2">
                    <div className="px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">
                      {group.label}
                    </div>
                    {group.items.map(r => {
                      const idx = runningIndex++;
                      const active = idx === activeIdx;
                      return (
                        <button
                          key={r.id}
                          onClick={() => {
                            navigate(r.href);
                            onClose();
                          }}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition"
                          style={{
                            background: active
                              ? "rgba(8,145,178,0.08)"
                              : "transparent",
                          }}
                        >
                          <span className="text-lg shrink-0">
                            {r.emoji || "•"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900 truncate">
                              {r.title}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {r.description}
                            </div>
                          </div>
                          <ArrowRight
                            className={`w-4 h-4 shrink-0 transition ${active ? "text-cyan-600 translate-x-0.5" : "text-slate-300"}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Footer hint */}
            <div
              className="px-5 py-3 border-t flex items-center justify-between text-[11px] text-slate-400"
              style={{ borderColor: "rgba(15,23,42,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded font-mono bg-slate-100">
                    ↑↓
                  </kbd>
                  navigate
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded font-mono bg-slate-100">
                    ↵
                  </kbd>
                  open
                </span>
              </div>
              <span>
                {results.length} result{results.length === 1 ? "" : "s"}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper: returns true if `a` should appear before `b` in the grouped list
function groupOrderBefore(a: string, b: string): boolean {
  const order = [
    "page",
    "film",
    "blog",
    "lesson",
    "pillar",
    "comparison",
    "reel",
    "creative",
  ];
  return order.indexOf(a) < order.indexOf(b);
}
