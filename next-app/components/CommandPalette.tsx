"use client";

// Cmd+K command palette — global search across every static route.
// Triggered by Cmd+K (Mac) / Ctrl+K (Windows/Linux), Esc to close.
//
// Searches over a hand-built registry of routes (every page, every film,
// every blog post, every lesson). Fuzzy matching by lowercased substring
// is intentionally simple — exact behavior of Linear's Cmd+K but without
// the dependency cost.

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, ArrowUpRight, Command } from "lucide-react";
import { FILMS } from "@lib/cinematicUniverse";
import { ECOSYSTEM_PILLARS } from "@lib/ecosystemPillars";
import { LESSONS } from "@lib/defi101";

interface Item {
  title: string;
  href: string;
  group: string;
  hint?: string;
}

const STATIC_ITEMS: Item[] = [
  { title: "Home", href: "/", group: "Pages" },
  { title: "Films — cinematic universe", href: "/films", group: "Pages" },
  { title: "Blog / Editorial", href: "/blog", group: "Pages" },
  { title: "Community", href: "/community", group: "Pages" },
  { title: "Security", href: "/security", group: "Pages" },
  { title: "Promotions ($100K bounty + earn programs)", href: "/promotions", group: "Pages" },
  { title: "Apply (Creator Star + Local Presenter)", href: "/apply", group: "Pages" },
  { title: "Submit your story", href: "/submit", group: "Pages" },
  { title: "Library — videos + decks in 48 languages", href: "/library", group: "Pages" },
  { title: "Creatives — 141 banners", href: "/creatives", group: "Pages" },
  { title: "Learn — DeFi 101", href: "/learn", group: "Pages" },
  { title: "Ecosystem — 6 pillars", href: "/ecosystem", group: "Pages" },
  { title: "FAQ", href: "/faq", group: "Pages" },
  { title: "Roadmap", href: "/roadmap", group: "Pages" },
  { title: "Yield Calculator", href: "/calculator", group: "Pages" },
  { title: "My Submissions — track your contributions", href: "/my-submissions", group: "Pages" },
  { title: "Privacy Policy", href: "/privacy", group: "Legal" },
  { title: "Terms of Use", href: "/terms", group: "Legal" },
  { title: "vs Banks", href: "/vs/banks", group: "Comparisons" },
  { title: "vs Other DeFi", href: "/vs/defi", group: "Comparisons" },
  { title: "vs Inflation", href: "/vs/inflation", group: "Comparisons" },
];

function buildAllItems(): Item[] {
  const filmItems: Item[] = FILMS.map(f => ({
    title: f.title,
    href: `/films/${f.slug}`,
    group: "Films",
    hint: `S${f.season} · E${f.episode} — ${f.tagline}`,
  }));
  const pillarItems: Item[] = ECOSYSTEM_PILLARS.map(p => ({
    title: p.title,
    href: `/ecosystem/${p.slug}`,
    group: "Ecosystem",
    hint: p.subtitle,
  }));
  const lessonItems: Item[] = LESSONS.map(l => ({
    title: l.title,
    href: `/learn/${l.slug}`,
    group: "DeFi 101",
    hint: l.summary,
  }));
  return [...STATIC_ITEMS, ...filmItems, ...pillarItems, ...lessonItems];
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allItems = useMemo(() => buildAllItems(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems.slice(0, 12);
    return allItems
      .filter(
        it =>
          it.title.toLowerCase().includes(q) ||
          it.group.toLowerCase().includes(q) ||
          (it.hint && it.hint.toLowerCase().includes(q))
      )
      .slice(0, 30);
  }, [allItems, query]);

  // Global keydown — open on Cmd/Ctrl+K, close on Esc, navigate on arrows.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isK = e.key === "k" || e.key === "K";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setOpen(o => !o);
        setQuery("");
        setActiveIdx(0);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      } else if (open) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveIdx(i => Math.min(filtered.length - 1, i + 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveIdx(i => Math.max(0, i - 1));
        } else if (e.key === "Enter") {
          const item = filtered[activeIdx];
          if (item) {
            setOpen(false);
            router.push(item.href);
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, activeIdx, router]);

  // Focus input on open + lock body scroll.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset active index when filter changes.
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  // Group filtered items by group label for visual sectioning.
  const groups: Record<string, Item[]> = {};
  filtered.forEach(it => {
    if (!groups[it.group]) groups[it.group] = [];
    groups[it.group].push(it);
  });

  let runningIdx = -1;

  return createPortal(
    <div
      className="fixed inset-0 z-[var(--z-modal,70)] flex items-start justify-center p-4 pt-[10vh] bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-[var(--r-2xl)] bg-[var(--c-surface)] shadow-[var(--s-xl)] border border-[var(--c-border)] overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{
          animation: "cmdk-in 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <style>{`
          @keyframes cmdk-in {
            from { opacity: 0; transform: translateY(-12px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* Search input */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-[var(--c-border)]">
          <Search className="w-5 h-5 text-[var(--c-text-subtle)] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, films, blog, lessons…"
            className="flex-1 bg-transparent outline-none text-base text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)]"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono text-[var(--c-text-subtle)] bg-[var(--c-bg)] border border-[var(--c-border)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-[var(--c-text-muted)]">
              No matches. Try a different word.
            </div>
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group} className="py-1">
                <div className="px-5 py-1 text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)]">
                  {group}
                </div>
                {items.map(item => {
                  runningIdx++;
                  const isActive = runningIdx === activeIdx;
                  return (
                    <button
                      key={item.href}
                      onMouseEnter={() => {
                        // Capture the index for hover-driven activation.
                        const idx = filtered.findIndex(f => f.href === item.href);
                        if (idx >= 0) setActiveIdx(idx);
                      }}
                      onClick={() => {
                        setOpen(false);
                        router.push(item.href);
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-left transition"
                      style={{
                        background: isActive
                          ? "color-mix(in oklab, var(--c-brand-cyan) 8%, transparent)"
                          : "transparent",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[var(--c-text)] truncate">
                          {item.title}
                        </div>
                        {item.hint && (
                          <div className="text-xs text-[var(--c-text-muted)] truncate mt-0.5">
                            {item.hint}
                          </div>
                        )}
                      </div>
                      <ArrowUpRight
                        className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[var(--c-brand-cyan)]" : "text-[var(--c-text-subtle)]"}`}
                      />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between gap-3 px-5 h-10 border-t border-[var(--c-border)] text-[0.6875rem] text-[var(--c-text-subtle)]">
          <span className="inline-flex items-center gap-1.5">
            <Command className="w-3 h-3" />
            <span>Cmd+K to toggle anytime</span>
          </span>
          <span>↑ ↓ to navigate · ↵ to open</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
