"use client";
// ── Creative Explorer Section ─────────────────────────────────────────────
// Interactive homepage section: browse 2,000+ banners by Language or Category.
//
// STATE DESIGN — pure client-side useState, zero routing/URL changes:
//   • Clicking a language tab instantly swaps banners with a smooth fade
//   • No page navigation, no URL params, no hydration issues
//   • defaultLocale prop sets the initial selection on first render only
//   • Switching back to English always works — it's just setState("english")

import { useCallback, useMemo, useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Share2, ChevronRight, X } from "lucide-react";
import manifest from "../../public/campaigns-manifest.json";
import { BannerShareModal } from "@components/creatives/BannerShareModal";

// ── Types ─────────────────────────────────────────────────────────────────

interface BannerItem {
  url: string;
  alt: string;
  title: string;
  category: string;
}

interface TabDef {
  id: string;
  label: string;
  flag: string;
  count: number;
  href: string;
  banners: BannerItem[];
}

// ── Data: Language tabs ───────────────────────────────────────────────────

const LANGUAGE_GROUPS: Array<{
  id: string;
  label: string;
  flag: string;
  categories: string[];
  href: string;
}> = [
  { id: "english",    label: "English",         flag: "🇬🇧", categories: ["lifestyle","token","referral","objection-handler","success-story","education-defi","urgency","buyback","comparison","community"], href: "/creatives" },
  { id: "hindi",      label: "Hindi",            flag: "🇮🇳", categories: ["hindi-new"],   href: "/creatives/hindi-new" },
  { id: "spanish",    label: "Spanish",          flag: "🇪🇸", categories: ["spanish"],     href: "/creatives/spanish" },
  { id: "nigerian",   label: "Nigerian Pidgin",  flag: "🇳🇬", categories: ["nigerian"],    href: "/creatives/nigerian" },
  { id: "indonesian", label: "Indonesian",       flag: "🇮🇩", categories: ["indonesian"],  href: "/creatives/indonesian" },
  { id: "chinese",    label: "Chinese",          flag: "🇨🇳", categories: ["chinese"],     href: "/creatives/chinese" },
  { id: "italian",    label: "Italian",          flag: "🇮🇹", categories: ["italian"],     href: "/creatives/italian" },
  { id: "arabic",     label: "Arabic",           flag: "🇸🇦", categories: ["arabic"],      href: "/creatives/arabic" },
  { id: "urdu",       label: "Urdu",             flag: "🇵🇰", categories: ["urdu"],        href: "/creatives/urdu" },
  { id: "german",     label: "German",           flag: "🇩🇪", categories: ["german"],      href: "/creatives/german" },
  { id: "thai",       label: "Thai",             flag: "🇹🇭", categories: ["thai"],        href: "/creatives/thai" },
  { id: "korean",     label: "Korean",           flag: "🇰🇷", categories: ["ko"],          href: "/creatives/ko" },
  { id: "lao",        label: "Lao",              flag: "🇱🇦", categories: ["la"],          href: "/creatives/la" },
  { id: "tamil",      label: "Tamil",            flag: "🇮🇳", categories: ["tamil"],       href: "/creatives/tamil" },
];

// ── Data: Category tabs ───────────────────────────────────────────────────

const CATEGORY_GROUPS: Array<{
  id: string;
  label: string;
  emoji: string;
  href: string;
}> = [
  { id: "lifestyle",         label: "Passive Income",     emoji: "🌴", href: "/creatives/lifestyle" },
  { id: "token",             label: "$TURBO Token",       emoji: "🪙", href: "/creatives/token" },
  { id: "referral",          label: "Referral",           emoji: "🤝", href: "/creatives/referral" },
  { id: "objection-handler", label: "Objection Handlers", emoji: "🛡️", href: "/creatives/objection-handler" },
  { id: "education-defi",    label: "DeFi Education",     emoji: "📚", href: "/creatives/education-defi" },
  { id: "comparison",        label: "vs Banks",           emoji: "⚖️", href: "/creatives/comparison" },
  { id: "buyback",           label: "Buyback & Burn",     emoji: "🔥", href: "/creatives/buyback" },
  { id: "success-story",     label: "Success Stories",    emoji: "🏆", href: "/creatives/success-story" },
  { id: "urgency",           label: "Urgency & FOMO",     emoji: "⏰", href: "/creatives/urgency" },
  { id: "community",         label: "Community",          emoji: "🌍", href: "/creatives/community" },
];

// ── Helpers ───────────────────────────────────────────────────────────────

type ManifestEntry = { url: string; alt: string; title: string; category: string };
const ALL: ManifestEntry[] = manifest as ManifestEntry[];

// Map from next-intl locale codes → LANGUAGE_GROUPS IDs
const LOCALE_TO_LANG_ID: Record<string, string> = {
  en: "english", th: "thai", ko: "korean", lo: "lao", hi: "hindi",
  ta: "tamil", ar: "arabic", zh: "chinese", it: "italian", ur: "urdu",
  fr: "french", es: "spanish", pcm: "nigerian", de: "german", id: "indonesian",
};

const VALID_LANG_IDS = new Set(LANGUAGE_GROUPS.map(g => g.id));
const VALID_CAT_IDS  = new Set(CATEGORY_GROUPS.map(g => g.id));

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build tabs once at module load — stable shuffles for the session
function buildLangTabs(): TabDef[] {
  return LANGUAGE_GROUPS.map(g => {
    const pool = ALL.filter(x => g.categories.includes(x.category));
    return { id: g.id, label: g.label, flag: g.flag, count: pool.length, href: g.href, banners: shuffle(pool).slice(0, 6) };
  });
}

function buildCatTabs(): TabDef[] {
  return CATEGORY_GROUPS.map(g => {
    const pool = ALL.filter(x => x.category === g.id);
    return { id: g.id, label: g.label, flag: g.emoji, count: pool.length, href: g.href, banners: shuffle(pool).slice(0, 6) };
  });
}

const LANG_TABS: TabDef[] = buildLangTabs();
const CAT_TABS:  TabDef[] = buildCatTabs();

// ── Banner Card ───────────────────────────────────────────────────────────

function BannerCard({
  item,
  index,
  activeTabId,
  onShare,
}: {
  item: BannerItem;
  index: number;
  activeTabId: string;
  onShare: (item: BannerItem) => void;
}) {
  const [lightbox, setLightbox] = useState(false);

  const handleShare = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); onShare(item); },
    [item, onShare]
  );

  return (
    <>
      <div
        className="group relative rounded-xl overflow-hidden cursor-pointer"
        style={{
          animationDelay: `${index * 50}ms`,
          animation: "ce-card-in 300ms cubic-bezier(0.16,1,0.3,1) both",
          border: "1px solid var(--c-border)",
          background: "var(--c-surface)",
        }}
        onClick={() => setLightbox(true)}
      >
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={item.url}
            alt={item.alt || item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
          >
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-transform active:scale-95"
              style={{ background: "var(--c-brand-gradient)", boxShadow: "var(--s-brand)" }}
              aria-label={`Share ${item.title}`}
            >
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
        <div className="px-3 py-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium truncate flex-1" style={{ color: "var(--c-text-muted, #94a3b8)" }}>
            {item.title || item.alt}
          </p>
          <button
            onClick={handleShare}
            className="sm:hidden flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white transition-transform active:scale-95"
            style={{ background: "var(--c-brand-gradient)" }}
            aria-label={`Share ${item.title}`}
          >
            <Share2 size={11} /> Share
          </button>
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
            onClick={() => setLightbox(false)}
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div
            className="relative max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={item.url} alt={item.alt || item.title} width={1080} height={1080} className="w-full h-auto" unoptimized />
            <div className="flex gap-3 p-4" style={{ background: "rgba(15,23,42,0.9)" }}>
              <button
                onClick={(e) => { e.stopPropagation(); onShare(item); setLightbox(false); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "var(--c-brand-gradient)" }}
              >
                <Share2 size={15} /> Share Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Tab Pill ──────────────────────────────────────────────────────────────

function TabPill({ id, label, flag, count, active, onClick }: {
  id: string; label: string; flag: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      data-tab-id={id}
      aria-selected={active}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0"
      style={{
        transition: "background 200ms ease, color 200ms ease, box-shadow 200ms ease, transform 100ms ease",
        ...(active
          ? { color: "white", background: "var(--c-brand-gradient)", boxShadow: "var(--s-brand)", border: "1px solid transparent" }
          : { color: "var(--c-text, #e2e8f0)", background: "color-mix(in oklab, var(--c-surface) 70%, transparent)", border: "1px solid var(--c-border)" }
        ),
      }}
      onMouseDown={e => (e.currentTarget.style.transform = "scale(0.96)")}
      onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      <span className="text-base leading-none" aria-hidden="true">{flag}</span>
      <span className="hidden sm:inline">{label}</span>
      <span
        className="text-[0.625rem] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
        style={{ background: active ? "rgba(255,255,255,0.2)" : "var(--c-border)", color: active ? "white" : "var(--c-text-muted, #94a3b8)" }}
      >
        {count.toLocaleString()}
      </span>
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export function CreativeExplorerSection({ defaultLocale }: { defaultLocale?: string } = {}) {
  const pillsRef = useRef<HTMLDivElement>(null);
  const [shareTarget, setShareTarget] = useState<BannerItem | null>(null);

  // Derive the initial language from the locale prop (runs once at mount)
  const initialLangId = useMemo(() => {
    if (defaultLocale && LOCALE_TO_LANG_ID[defaultLocale] && VALID_LANG_IDS.has(LOCALE_TO_LANG_ID[defaultLocale])) {
      return LOCALE_TO_LANG_ID[defaultLocale];
    }
    return "english";
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — intentionally only on mount

  const [mode, setMode]         = useState<"language" | "category">("language");
  const [activeLang, setActiveLang] = useState<string>(initialLangId);
  const [activeCat,  setActiveCat]  = useState<string>("lifestyle");

  // Grid fade key — changes trigger the fade-in animation
  const [gridKey, setGridKey] = useState(0);

  const tabs     = mode === "language" ? LANG_TABS : CAT_TABS;
  const activeId = mode === "language" ? activeLang : activeCat;
  const activeTab = tabs.find(t => t.id === activeId) ?? tabs[0];

  // Scroll active pill into view whenever selection changes
  useEffect(() => {
    const el = pillsRef.current?.querySelector(`[data-tab-id="${activeId}"]`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, [activeId, mode]);

  function selectLang(id: string) {
    if (id === activeLang && mode === "language") return; // already selected
    setActiveLang(id);
    setMode("language");
    setGridKey(k => k + 1);
  }

  function selectCat(id: string) {
    if (id === activeCat && mode === "category") return; // already selected
    setActiveCat(id);
    setMode("category");
    setGridKey(k => k + 1);
  }

  function switchMode(m: "language" | "category") {
    if (m === mode) return;
    setMode(m);
    setGridKey(k => k + 1);
  }

  const handleShare = useCallback((item: BannerItem) => setShareTarget(item), []);

  return (
    <>
      <section
        className="relative py-16 md:py-24 overflow-hidden"
        aria-labelledby="ce-heading"
      >
        {/* Background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(8,145,178,0.07) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(124,58,237,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--c-brand-cyan)" }}>
              Free Creative Library
            </p>
            <h2
              id="ce-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4"
              style={{ color: "var(--c-text, #0f172a)" }}
            >
              2,800+ Banners.{" "}
              <span style={{ background: "var(--c-brand-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                14 Languages.
              </span>{" "}
              All Free.
            </h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: "var(--c-text-muted, #94a3b8)" }}>
              Browse, download, and share — no attribution required. Pick your language or topic below.
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex rounded-full p-1 gap-1"
              style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
            >
              {(["language", "category"] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className="px-5 py-2 rounded-full text-sm font-bold"
                  style={{
                    transition: "background 200ms ease, color 200ms ease, box-shadow 200ms ease",
                    ...(mode === m
                      ? { background: "var(--c-brand-gradient)", color: "white", boxShadow: "var(--s-brand)" }
                      : { color: "var(--c-text-muted, #94a3b8)" }
                    ),
                  }}
                >
                  {m === "language" ? "🌍 By Language" : "🗂️ By Category"}
                </button>
              ))}
            </div>
          </div>

          {/* Tab pills — horizontal scroll */}
          <div
            ref={pillsRef}
            className="overflow-x-auto pb-3 mb-8"
            role="tablist"
            aria-label={mode === "language" ? "Browse by language" : "Browse by category"}
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex items-center gap-2" style={{ width: "max-content", minWidth: "100%" }}>
              {tabs.map(tab => (
                <TabPill
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  flag={tab.flag}
                  count={tab.count}
                  active={tab.id === activeId}
                  onClick={() => mode === "language" ? selectLang(tab.id) : selectCat(tab.id)}
                />
              ))}
            </div>
          </div>

          {/* Banner grid — fades in on tab change */}
          <div
            key={gridKey}
            role="tabpanel"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
            style={{ animation: "ce-grid-fade 250ms ease both" }}
          >
            {activeTab?.banners.map((item, i) => (
              <BannerCard
                key={item.url}
                item={item}
                index={i}
                activeTabId={activeId}
                onShare={handleShare}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link
              href={activeTab?.href ?? "/creatives"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: "var(--c-brand-gradient)", boxShadow: "var(--s-brand)" }}
            >
              See all {activeTab?.count.toLocaleString()} {activeTab?.label} banners
              <ChevronRight size={16} />
            </Link>
            <p className="mt-3 text-xs" style={{ color: "var(--c-text-muted, #94a3b8)" }}>
              Free forever · No sign-up · No attribution required
            </p>
          </div>

        </div>

        {/* Animations */}
        <style>{`
          @keyframes ce-card-in {
            from { opacity: 0; transform: translateY(12px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)    scale(1); }
          }
          @keyframes ce-grid-fade {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          [role="tablist"]::-webkit-scrollbar { display: none; }
        `}</style>
      </section>

      {shareTarget && (
        <BannerShareModal
          banner={shareTarget}
          language={mode === "language" ? activeLang : "english"}
          onClose={() => setShareTarget(null)}
        />
      )}
    </>
  );
}
