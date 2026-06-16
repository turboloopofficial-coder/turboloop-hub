// ── Creative Explorer Section (Vite/React) ────────────────────────────────
// Interactive homepage section — browse 1,400+ banners by Language or Category.
// Uses Framer Motion (already in the project) for card animations.
// Data is imported at build time from campaigns-manifest.json.

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Link2, ChevronRight, X } from "lucide-react";
import campaignsManifest from "@/lib/campaigns-manifest.json";

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

// ── Data: Language groups ─────────────────────────────────────────────────

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

// ── Data: Category groups ─────────────────────────────────────────────────

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

const ALL: BannerItem[] = campaignsManifest as BannerItem[];

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
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="group relative rounded-xl overflow-hidden cursor-pointer"
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}
        onClick={() => setLightbox(true)}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={item.url}
            alt={item.alt || item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Hover overlay */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
          >
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white transition-transform active:scale-95"
              style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)", boxShadow: "0 4px 16px rgba(6,182,212,0.4)" }}
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
            >
              <Link2 size={14} />
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
        {/* Mobile action buttons — always visible below the image on touch devices */}
        <div className="flex gap-2 px-3 py-2 sm:hidden">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}
          >
            <Download size={12} />
            Download
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
          >
            <Link2 size={12} />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        {/* Title strip — desktop only (mobile shows buttons instead) */}
        <div className="hidden sm:block px-3 py-2">
          <p className="text-xs font-medium truncate text-slate-400">
            {item.title || item.alt}
          </p>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
            onClick={() => setLightbox(false)}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full"
              style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
              onClick={() => setLightbox(false)}
            >
              <X size={20} />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={item.url}
                alt={item.alt || item.title}
                className="w-full h-auto"
              />
              <div
                className="flex gap-3 p-4"
                style={{ background: "rgba(15,23,42,0.95)" }}
              >
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}
                >
                  <Download size={15} /> Download Free
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
                >
                  <Link2 size={15} /> {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Tab Pill ──────────────────────────────────────────────────────────────

function TabPill({
  label, flag, count, active, onClick,
}: {
  label: string; flag: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-full text-sm font-semibold transition-all active:scale-[0.97] whitespace-nowrap flex-shrink-0"
      style={
        active
          ? {
              color: "white",
              background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              boxShadow: "0 4px 16px rgba(6,182,212,0.35)",
              border: "1px solid transparent",
            }
          : {
              color: "#94a3b8",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }
      }
    >
      <span className="text-base leading-none">{flag}</span>
      <span className="hidden sm:inline">{label}</span>
      <span
        className="text-[0.625rem] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
        style={{
          background: active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)",
          color: active ? "white" : "#64748b",
        }}
      >
        {count.toLocaleString()}
      </span>
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function CreativeExplorerSection() {
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

  // Scroll active pill into view on tab change
  useEffect(() => {
    const el = pillsRef.current?.querySelector('[data-active="true"]') as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [activeId, mode]);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
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
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-cyan-400">
            Free Creative Library
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
            1,400+ Banners.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #06b6d4, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              11 Languages.
            </span>{" "}
            All Free.
          </h2>
          <p className="text-base md:text-lg max-w-2xl mx-auto text-slate-400">
            Browse, download, and share — no attribution required. Pick your language or topic below.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex justify-center mb-8">
          <div
            className="inline-flex rounded-full p-1 gap-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {(["language", "category"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-5 py-2 rounded-full text-sm font-bold transition-all"
                style={
                  mode === m
                    ? { background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "white", boxShadow: "0 4px 16px rgba(6,182,212,0.35)" }
                    : { color: "#94a3b8" }
                }
              >
                {m === "language" ? "🌍 By Language" : "🗂️ By Category"}
              </button>
            ))}
          </div>
        </div>

        {/* Tab pills */}
        <div
          ref={pillsRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 mb-8"
          style={{ scrollbarWidth: "none" }}
        >
          {tabs.map(tab => (
            <div key={tab.id} data-active={tab.id === activeId ? "true" : "false"}>
              <TabPill
                label={tab.label}
                flag={tab.flag}
                count={tab.count}
                active={tab.id === activeId}
                onClick={() => setActive(tab.id)}
              />
            </div>
          ))}
        </div>

        {/* Banner grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${activeId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
          >
            {activeTab?.banners.map((item, i) => (
              <BannerCard key={item.url} item={item} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href={activeTab?.href ?? "/creatives"}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)", boxShadow: "0 4px 16px rgba(6,182,212,0.35)" }}
          >
            See all {activeTab?.count.toLocaleString()} {activeTab?.label} banners
            <ChevronRight size={16} />
          </a>
          <p className="mt-3 text-xs text-slate-500">
            Free forever · No sign-up · No attribution required
          </p>
        </div>

      </div>
    </section>
  );
}
