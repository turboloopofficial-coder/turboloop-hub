"use client";
// ── Creative Explorer Section ─────────────────────────────────────────────
// Interactive homepage section that lets visitors browse 1,400+ banners
// by Language or by Category. Zero external fetches — data is embedded
// at build time from the static manifest.
//
// Architecture:
//   • Server wrapper (CreativeExplorerSection) pre-selects a random
//     sample of 6 banners per tab and passes them as props.
//   • Client island (CreativeExplorerTabs) owns the active-tab state,
//     animates card transitions, and handles Download / Copy-link actions.
//
// This file is "use client" because it owns interactive state.
// The parent page.tsx imports it via dynamic() so the JS chunk is
// deferred until below the fold.

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Link2, ChevronRight, X } from "lucide-react";
import manifest from "../../public/campaigns-manifest.json";

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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildLangTabs(): TabDef[] {
  return LANGUAGE_GROUPS.map(g => {
    const pool = ALL.filter(x => g.categories.includes(x.category));
    return {
      id: g.id,
      label: g.label,
      flag: g.flag,
      count: pool.length,
      href: g.href,
      banners: shuffle(pool).slice(0, 6),
    };
  });
}

function buildCatTabs(): TabDef[] {
  return CATEGORY_GROUPS.map(g => {
    const pool = ALL.filter(x => x.category === g.id);
    return {
      id: g.id,
      label: g.label,
      flag: g.emoji,
      count: pool.length,
      href: g.href,
      banners: shuffle(pool).slice(0, 6),
    };
  });
}

// ── Banner Card ───────────────────────────────────────────────────────────

function BannerCard({ item, index }: { item: BannerItem; index: number }) {
  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(item.url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = item.url.split("/").pop() ?? "turboloop-banner.png";
      a.click();
    } catch {
      window.open(item.url, "_blank");
    }
  }, [item.url]);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [item.url]);

  return (
    <>
      {/* Card */}
      <div
        className="group relative rounded-xl overflow-hidden cursor-pointer"
        style={{
          animationDelay: `${index * 60}ms`,
          animation: "ce-card-in 350ms cubic-bezier(0.16,1,0.3,1) both",
          border: "1px solid var(--c-border)",
          background: "var(--c-surface)",
        }}
        onClick={() => setLightbox(true)}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={item.url}
            alt={item.alt || item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          {/* Hover overlay */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
          >
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white transition-transform active:scale-95"
              style={{ background: "var(--c-brand-gradient)", boxShadow: "var(--s-brand)" }}
              aria-label="Download banner"
            >
              <Download size={14} />
              Download
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-transform active:scale-95"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "white",
              }}
              aria-label="Copy image link"
            >
              <Link2 size={14} />
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
        {/* Title strip */}
        <div className="px-3 py-2">
          <p className="text-xs font-medium truncate" style={{ color: "var(--c-text-muted, #94a3b8)" }}>
            {item.title || item.alt}
          </p>
        </div>
      </div>

      {/* Lightbox */}
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
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={item.url}
              alt={item.alt || item.title}
              width={1080}
              height={1080}
              className="w-full h-auto"
              unoptimized
            />
            <div
              className="flex gap-3 p-4"
              style={{ background: "rgba(15,23,42,0.9)" }}
            >
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "var(--c-brand-gradient)" }}
              >
                <Download size={15} /> Download Free
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
              >
                <Link2 size={15} /> {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Tab Pill ──────────────────────────────────────────────────────────────

function TabPill({
  id, label, flag, count, active, onClick,
}: {
  id: string; label: string; flag: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-full text-sm font-semibold transition-all active:scale-[0.97] whitespace-nowrap"
      style={
        active
          ? {
              color: "white",
              background: "var(--c-brand-gradient)",
              boxShadow: "var(--s-brand)",
              border: "1px solid transparent",
            }
          : {
              color: "var(--c-text, #e2e8f0)",
              background: "color-mix(in oklab, var(--c-surface) 70%, transparent)",
              border: "1px solid var(--c-border)",
            }
      }
    >
      <span className="text-base leading-none" aria-hidden="true">{flag}</span>
      <span className="hidden sm:inline">{label}</span>
      <span
        className="text-[0.625rem] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
        style={{
          background: active ? "rgba(255,255,255,0.2)" : "var(--c-border)",
          color: active ? "white" : "var(--c-text-muted, #94a3b8)",
        }}
      >
        {count.toLocaleString()}
      </span>
    </button>
  );
}

// ── Main Client Component ─────────────────────────────────────────────────

export function CreativeExplorerSection() {
  const [mode, setMode] = useState<"language" | "category">("language");
  const [langTabs] = useState<TabDef[]>(() => buildLangTabs());
  const [catTabs] = useState<TabDef[]>(() => buildCatTabs());
  const [activeLang, setActiveLang] = useState("english");
  const [activeCat, setActiveCat] = useState("lifestyle");
  const pillsRef = useRef<HTMLDivElement>(null);

  const tabs = mode === "language" ? langTabs : catTabs;
  const activeId = mode === "language" ? activeLang : activeCat;
  const setActive = mode === "language" ? setActiveLang : setActiveCat;
  const activeTab = tabs.find(t => t.id === activeId) ?? tabs[0];

  // Scroll active pill into view
  useEffect(() => {
    const el = pillsRef.current?.querySelector('[aria-selected="true"]') as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [activeId, mode]);

  return (
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
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--c-brand-cyan)" }}
          >
            Free Creative Library
          </p>
          <h2
            id="ce-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4"
            style={{ color: "var(--c-heading, #f1f5f9)" }}
          >
            1,400+ Banners.{" "}
            <span
              style={{
                background: "var(--c-brand-gradient)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              11 Languages.
            </span>{" "}
            All Free.
          </h2>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto"
            style={{ color: "var(--c-text-muted, #94a3b8)" }}
          >
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
                onClick={() => setMode(m)}
                className="px-5 py-2 rounded-full text-sm font-bold transition-all"
                style={
                  mode === m
                    ? { background: "var(--c-brand-gradient)", color: "white", boxShadow: "var(--s-brand)" }
                    : { color: "var(--c-text-muted, #94a3b8)" }
                }
              >
                {m === "language" ? "🌍 By Language" : "🗂️ By Category"}
              </button>
            ))}
          </div>
        </div>

        {/* Tab pills — horizontal scroll on mobile */}
        <div
          ref={pillsRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide"
          role="tablist"
          aria-label={mode === "language" ? "Browse by language" : "Browse by category"}
          style={{ scrollbarWidth: "none" }}
        >
          {tabs.map(tab => (
            <TabPill
              key={tab.id}
              id={tab.id}
              label={tab.label}
              flag={tab.flag}
              count={tab.count}
              active={tab.id === activeId}
              onClick={() => setActive(tab.id)}
            />
          ))}
        </div>

        {/* Banner grid */}
        <div
          key={`${mode}-${activeId}`}
          role="tabpanel"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
        >
          {activeTab?.banners.map((item, i) => (
            <BannerCard key={item.url} item={item} index={i} />
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

      {/* Card entrance animation */}
      <style>{`
        @keyframes ce-card-in {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
