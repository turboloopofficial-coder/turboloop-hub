"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /podcast — TurboLoop CEO Podcast Page
//
// ✅  FULLY DATA-DRIVEN — no hardcoded episode blocks.
//     To add a new episode: edit next-app/lib/episodes.config.ts only.
//     This page loops over EPISODES automatically.
//
// ✅  Language data lives in: next-app/lib/videoLanguages.ts
//     Episode video data is accessed via: lang.episodes[epId]
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Play, Globe, ChevronDown, Download, Youtube, Share2,
  Mic, Clock, Languages, Lock, Sparkles,
} from "lucide-react";
import {
  LANGUAGES, ENGLISH, LOCALE_TO_VIDEO_CODE, type VideoLanguage,
} from "@/lib/videoLanguages";
import { EPISODES, BADGE_COLORS, type EpisodeConfig } from "@/lib/episodes.config";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";

const STORAGE_KEY = "turboloop_lang";

// ─── Resolve initial language (localStorage → URL locale → English) ──────────
function resolveInitialLang(locale: string, epId: string): VideoLanguage {
  // 1. Check localStorage first (user's explicit previous choice)
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const match = LANGUAGES.find(l => l.code === saved);
        if (match) return match; // use saved lang even if episode not yet available (shows "coming soon")
      }
    } catch { /* ignore */ }
  }
  // 2. Fall back to URL locale
  if (!locale || locale === "en") return ENGLISH;
  const code = LOCALE_TO_VIDEO_CODE[locale] ?? null;
  if (!code) return ENGLISH;
  const match = LANGUAGES.find(l => l.code === code);
  if (!match) return ENGLISH;
  return match;
}

// ─── Extract locale from pathname (/ar/podcast → "ar", /podcast → "en") ─────
function localeFromPathname(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length >= 2 && parts[1] === "podcast") return parts[0];
  if (parts.length === 1 && parts[0] === "podcast") return "en";
  if (parts.length >= 1 && parts[0] !== "podcast") return parts[0];
  return "en";
}

// ─── PodcastPlayer ───────────────────────────────────────────────────────────
function PodcastPlayer({
  ep,
  defaultLocale,
}: {
  ep: EpisodeConfig;
  defaultLocale: string;
}) {
  const epId = ep.id;
    const [started, setStarted]           = useState(false);
  const [selectedLang, setSelectedLang] = useState<VideoLanguage>(() =>
    resolveInitialLang(defaultLocale, epId)
  );
  const [showPicker, setShowPicker]     = useState(false);
  const [thumbLoaded, setThumbLoaded]   = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Re-resolve when defaultLocale changes (e.g. SSR hydration)
  useEffect(() => {
    setSelectedLang(resolveInitialLang(defaultLocale, epId));
    setStarted(false);
  }, [defaultLocale, epId]);

  // Derived values — must be declared BEFORE any useEffect that references them
  const getEpData = (lang: VideoLanguage) => lang.episodes[epId] ?? null;
  const isAvailable = (l: VideoLanguage) => (getEpData(l)?.video ?? null) !== null;
  const activeEpData  = getEpData(selectedLang)?.video ? getEpData(selectedLang)! : getEpData(ENGLISH)!;
  const activeVideo   = activeEpData.video ?? "";
  const activeYoutube = activeEpData.youtubeUrl ?? null;
  const activeThumb   = activeEpData.thumb ?? getEpData(ENGLISH)?.thumb ?? "";
  const available     = LANGUAGES.filter(isAvailable);

  // Reset thumb loaded state when thumbnail changes
  useEffect(() => { setThumbLoaded(false); }, [activeThumb]);

  const badgeColors = BADGE_COLORS[ep.badgeColor] ?? BADGE_COLORS.cyan;

  const handlePlay = useCallback(async () => {
    const vid = videoRef.current;
    if (!vid) return;
    try {
      vid.load();
      vid.muted = true;
      await vid.play();
      vid.muted = false;
      setStarted(true);
    } catch {
      setStarted(true);
    }
  }, [activeVideo]);

  const { saveLanguage } = useLanguagePreference();

  const handleLangSelect = (lang: VideoLanguage) => {
    if (!isAvailable(lang)) return;
    setSelectedLang(lang);
    saveLanguage(lang.code); // persist across pages
    setShowPicker(false);
    setStarted(false);
  };

  const handleShare = () => {
    const text =
      `🎬 ${ep.title} — ${ep.subtitle}\n\n${ep.description}\n\n🌍 Now available in ${selectedLang.label}` +
      (activeYoutube ? `\n\n▶️ Watch on YouTube:\n${activeYoutube}` : "") +
      `\n\n⬇️ Download (${selectedLang.label}):\n${activeVideo}` +
      "\n\n🔗 turboloop.tech/podcast";
    if (navigator.share) {
      navigator.share({ title: "TurboLoop Podcast", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => alert("Links copied!")).catch(() => {});
    }
  };

  // Play button color from badge color
  const playBtnClass =
    ep.badgeColor === "violet"  ? "bg-violet-500 shadow-[0_0_40px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_60px_rgba(139,92,246,0.7)]" :
    ep.badgeColor === "amber"   ? "bg-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.5)] group-hover:shadow-[0_0_60px_rgba(245,158,11,0.7)]" :
    ep.badgeColor === "emerald" ? "bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)] group-hover:shadow-[0_0_60px_rgba(16,185,129,0.7)]" :
    ep.badgeColor === "rose"    ? "bg-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.5)] group-hover:shadow-[0_0_60px_rgba(244,63,94,0.7)]" :
    ep.badgeColor === "blue"    ? "bg-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_60px_rgba(59,130,246,0.7)]" :
    ep.badgeColor === "pink"    ? "bg-pink-500 shadow-[0_0_40px_rgba(236,72,153,0.5)] group-hover:shadow-[0_0_60px_rgba(236,72,153,0.7)]" :
    "bg-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.5)] group-hover:shadow-[0_0_60px_rgba(6,182,212,0.7)]";

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/60 bg-[#0d1220]">
      {/* Video area */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {!started && (
          <div className="absolute inset-0">
            {/* Skeleton shimmer while thumbnail loads */}
            {!thumbLoaded && (
              <div className="absolute inset-0 bg-[#0d1220] overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeThumb}
              src={activeThumb}
              alt={ep.title}
              className={`w-full h-full object-cover transition-opacity duration-500 ${thumbLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setThumbLoaded(true)}
              // @ts-expect-error fetchpriority is valid HTML but not yet in React types
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center group"
              aria-label="Play video"
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${playBtnClass}`}>
                <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white fill-white ml-1" />
              </div>
            </button>
          </div>
        )}
        {started && (
          <video
            ref={videoRef}
            src={activeVideo}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover bg-black"
            controlsList="nodownload"
          />
        )}
        {/* Episode badge overlay */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${badgeColors.bg} ${badgeColors.text} ${badgeColors.border}`}>
            EP {ep.number}
          </span>
        </div>
        {/* Language selector pill */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => setShowPicker(p => !p)}
            aria-label={`Change language — currently ${selectedLang.label}`}
            aria-expanded={showPicker}
            aria-haspopup="listbox"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white text-xs font-medium hover:bg-black/80 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{selectedLang.flag} {selectedLang.label}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {showPicker && (
            <div className="absolute top-full right-0 mt-2 w-52 max-h-64 overflow-y-auto rounded-xl bg-[#0d1220] border border-white/10 shadow-2xl z-20">
              {LANGUAGES.map(lang => {
                const avail = isAvailable(lang);
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLangSelect(lang)}
                    disabled={!avail}
                    aria-label={`${avail ? "Watch in" : "Coming soon:"} ${lang.label}`}
                    role="option"
                    aria-selected={selectedLang.code === lang.code}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition ${
                      avail
                        ? "hover:bg-white/[0.06] text-white cursor-pointer"
                        : "text-gray-600 cursor-not-allowed"
                    } ${selectedLang.code === lang.code ? "bg-white/[0.08]" : ""}`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="flex-1">{lang.label}</span>
                    {!avail && <Lock className="w-3 h-3 text-gray-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white/[0.03] border-t border-white/[0.06] flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-sm text-gray-400">
              {selectedLang.label} · {ep.duration} · Full HD
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08]">SolidityScan 99.99</span>
            <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08]">HazeCrypto Audited</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {activeYoutube && (
            <a
              href={activeYoutube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube</span>
            </a>
          )}
          <a
            href={activeVideo}
            download={`TurboLoop-Podcast-Ep${ep.number}-${selectedLang.label}.mp4`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
          <button
            onClick={handleShare}
            aria-label={`Share ${ep.title} in ${selectedLang.label}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
        <p className="text-xs text-gray-600">
          English Original · AI-Dubbed in {available.length} language{available.length !== 1 ? "s" : ""} — rolling out now.
        </p>
      </div>
    </div>
  );
}

// ─── Single episode section ──────────────────────────────────────────────────
function EpisodeSection({
  ep,
  defaultLocale,
}: {
  ep: EpisodeConfig;
  defaultLocale: string;
}) {
  const badgeColors = BADGE_COLORS[ep.badgeColor] ?? BADGE_COLORS.cyan;

  return (
    <section id={ep.id} className="scroll-mt-24">
      <div className="mb-6">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase border mb-4 ${badgeColors.bg} ${badgeColors.text} ${badgeColors.border}`}>
          {ep.badgeLabel}
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
          {ep.title}
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
          {ep.description}
        </p>
      </div>

      <PodcastPlayer ep={ep} defaultLocale={defaultLocale} />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Topics */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Topics Covered</h3>
          <div className="flex flex-wrap gap-2">
            {ep.topics.map(topic => (
              <span
                key={topic}
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeColors.bg} ${badgeColors.text} ${badgeColors.border}`}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
        {/* Quote */}
        <div className={`rounded-xl border p-5 relative overflow-hidden ${badgeColors.border} ${badgeColors.bg}`}>
          <div className={`absolute top-3 left-4 text-5xl font-black opacity-10 leading-none ${badgeColors.text}`}>"</div>
          <p className={`relative z-10 text-sm sm:text-base font-medium leading-relaxed italic mt-3 ${badgeColors.text}`}>
            &ldquo;{ep.quote}&rdquo;
          </p>
          <p className="mt-3 text-xs text-gray-500 font-semibold uppercase tracking-widest">— CEO Dave</p>
        </div>
      </div>
    </section>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function PodcastPage() {
  const pathname   = usePathname();
  const locale     = localeFromPathname(pathname ?? "");
  const totalLangs = LANGUAGES.filter(l => l.episodes.ep1?.video !== null).length;
  const totalRuntime = EPISODES.reduce((sum, ep) => {
    const mins = parseInt(ep.duration);
    return sum + (isNaN(mins) ? 0 : mins);
  }, 0);
  const [activeEp, setActiveEp] = useState<string>(EPISODES[0]?.id ?? "ep1");
  const [stickyVisible, setStickyVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Show sticky nav once user scrolls past the hero
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // Update activeEp as user scrolls through episodes
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    EPISODES.forEach(ep => {
      const el = document.getElementById(ep.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveEp(ep.id); },
        { threshold: 0.2 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollToEp = (id: string) => {
    setActiveEp(id);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <main className="min-h-screen bg-[#080c14] text-white">

      {/* ── Sticky Episode Nav — appears after scrolling past hero ──── */}
      <div
        className={`fixed top-[var(--nav-height,64px)] left-0 right-0 z-40 transition-all duration-300 ${
          stickyVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-[#080c14]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-1 h-12 overflow-x-auto scrollbar-none">
            {EPISODES.map(ep => {
              const isActive = activeEp === ep.id;
              const badgeColors = BADGE_COLORS[ep.badgeColor] ?? BADGE_COLORS.cyan;
              return (
                <button
                  key={ep.id}
                  onClick={() => scrollToEp(ep.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? `${badgeColors.bg} ${badgeColors.text} border ${badgeColors.border}`
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.05]"
                  }`}
                >
                  <span>Ep {ep.number}</span>
                  <span className="hidden sm:inline opacity-70">· {ep.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/[0.07] rounded-full blur-[140px]" />
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[400px] bg-purple-500/[0.05] rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] bg-blue-500/[0.04] rounded-full blur-[100px]" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-6">
            <Mic className="w-3.5 h-3.5" />
            <span>The TurboLoop Podcast</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            <span className="text-white">CEO Dave.</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              No Filters. No Scripts.
            </span>
            <br />
            <span className="text-white">Just Truth.</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            The definitive DeFi podcast series — where TurboLoop&apos;s CEO answers the questions
            your bank hopes you never ask.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-10">
            <div className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-cyan-500" />
              <span><strong className="text-white">{EPISODES.length}</strong> Episodes</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span><strong className="text-white">{totalRuntime} min</strong> Total Runtime</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-cyan-500" />
              <span><strong className="text-white">{totalLangs}+</strong> Languages</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span><strong className="text-white">English Original</strong> · AI-Dubbed</span>
            </div>
          </div>

          {/* ── Episode selector cards — auto-generated from EPISODES ── */}
          <div className={`grid grid-cols-1 gap-4 max-w-4xl mx-auto ${
            EPISODES.length <= 3 ? "sm:grid-cols-3" :
            EPISODES.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" :
            "sm:grid-cols-2 lg:grid-cols-3"
          }`}>
            {EPISODES.map(ep => {
              const isActive = activeEp === ep.id;
              const langCount = LANGUAGES.filter(l => (l.episodes[ep.id]?.video ?? null) !== null).length;
              const badgeColors = BADGE_COLORS[ep.badgeColor] ?? BADGE_COLORS.cyan;
              return (
                <button
                  key={ep.id}
                  onClick={() => scrollToEp(ep.id)}
                  className={`relative text-left rounded-2xl border p-5 transition-all duration-300 group ${
                    isActive
                      ? `${badgeColors.border.replace("/20", "/50")} ${badgeColors.bg} shadow-[0_0_30px_rgba(0,0,0,0.3)]`
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  }`}
                >
                  {isActive && (
                    <div className={`absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse ${badgeColors.text.replace("text-", "bg-")}`} />
                  )}
                  <div className={`text-xs font-bold tracking-widest uppercase mb-3 ${isActive ? badgeColors.text : "text-gray-600"}`}>
                    Episode {ep.number}
                  </div>
                  <div className="font-bold text-white text-base leading-snug mb-2">
                    {ep.title}
                  </div>
                  <div className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2">
                    {ep.subtitle}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ep.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Languages className="w-3 h-3" />
                      {langCount} lang{langCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {isActive && (
                    <div className={`mt-4 flex items-center gap-1.5 text-xs font-semibold ${badgeColors.text}`}>
                      <Play className="w-3 h-3 fill-current" />
                      Jump to Episode
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── All Episodes — auto-generated from EPISODES ───────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-20">
        {EPISODES.map((ep, i) => (
          <div key={ep.id}>
            {i > 0 && (
              <div className="flex items-center gap-4 mb-12">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-gray-600 uppercase tracking-widest font-semibold">Episode {ep.number}</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
            )}
            <EpisodeSection ep={ep} defaultLocale={locale} />
          </div>
        ))}

        {/* ── CTA strip ────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.07] to-purple-500/[0.05] p-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Ready to Earn?
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Turn what you just learned into income.
          </h3>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mb-6">
            Start with as little as $1 USDT. Earn up to 54% APY. Withdraw anytime.
            Audited, transparent, and live on BNB Smart Chain.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://turboloop.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm hover:opacity-90 transition shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Launch App →
            </a>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-cyan-500/30 text-cyan-400 font-semibold text-sm hover:bg-cyan-500/10 transition"
            >
              💰 Calculate My Returns
            </Link>
            <Link
              href="/films"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-gray-300 font-semibold text-sm hover:bg-white/[0.05] transition"
            >
              🎬 Watch Films
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
