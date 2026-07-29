"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /podcast — TurboLoop CEO Podcast
// Shows ALL episodes simultaneously.
// • Each episode has its own language picker — defaults to global site locale
// • Thumbnails change reactively when language is switched
// • Episode selector cards at top for quick navigation
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

// ─── Resolve initial language from URL locale ────────────────────────────────
function resolveInitialLang(locale: string, requireEp: "ep1" | "ep2" | "ep3"): VideoLanguage {
  if (!locale || locale === "en") return ENGLISH;
  const code = LOCALE_TO_VIDEO_CODE[locale] ?? null;
  if (!code) return ENGLISH;
  const match = LANGUAGES.find(l => l.code === code);
  if (!match) return ENGLISH;
  // For ep2/ep3, only use the locale lang if that episode is available; otherwise fall back to English
  if (requireEp === "ep2" && !match.ep2video) return ENGLISH;
  if (requireEp === "ep3" && !match.ep3video) return ENGLISH;
  return match;
}

// ─── Extract locale from pathname (/ar/podcast → "ar", /podcast → "en") ─────
function localeFromPathname(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length >= 2 && parts[1] === "podcast") return parts[0]; // /ar/podcast
  if (parts.length === 1 && parts[0] === "podcast") return "en";     // /podcast
  if (parts.length >= 1 && parts[0] !== "podcast") return parts[0]; // /ar
  return "en";
}

// ─── Episode metadata ────────────────────────────────────────────────────────
const EPISODES = [
  {
    id: "ep1" as const,
    num: 1,
    badge: "Deep Dive · Episode 1",
    badgeColor: "cyan" as const,
    title: "Your Bank is Lying to You",
    subtitle: "TurboLoop Explained",
    description:
      "A 20-minute cinematic breakdown covering security audits, smart contract architecture, and how your USDT earns fixed returns on BNB Smart Chain — dual-audited, LP locked, and open to anyone with $1 USDT.",
    duration: "20 min",
    topics: ["Security Audits", "Smart Contracts", "54% APY", "LP Locked", "BNB Smart Chain", "USDT Yield"],
    quote: "\"The code is immutable. The returns are fixed. The auditors verified it. What else do you need?\"",
    getVideo:     (l: VideoLanguage) => l.video,
    getYoutube:   (l: VideoLanguage) => l.youtubeUrl,
    getThumb:     (l: VideoLanguage) => l.thumb ?? ENGLISH.thumb ?? "",
    getLangCount: () => LANGUAGES.filter(l => l.video !== null).length,
  },
  {
    id: "ep2" as const,
    num: 2,
    badge: "Turbo Podcast · Episode 2",
    badgeColor: "purple" as const,
    title: "Is TurboLoop Legit?",
    subtitle: "CEO Answers 19 Tough Questions",
    description:
      "CEO Dave goes on record answering the hardest community questions about revenue sustainability, smart contract security, on-chain verification, and the $100K bug bounty challenge.",
    duration: "21 min",
    topics: ["CEO AMA", "Revenue Model", "On-Chain Proof", "$100K Bounty", "Community Q&A", "Sustainability"],
    quote: "\"Ask me anything. I have nothing to hide — because the blockchain has nothing to hide.\"",
    getVideo:     (l: VideoLanguage) => l.ep2video,
    getYoutube:   (l: VideoLanguage) => l.ep2youtubeUrl,
    getThumb:     (l: VideoLanguage) => l.ep2thumb ?? ENGLISH.ep2thumb ?? l.thumb ?? ENGLISH.thumb ?? "",
    getLangCount: () => LANGUAGES.filter(l => l.ep2video !== null).length,
  },
  {
    id: "ep3" as const,
    num: 3,
    badge: "Turbo Podcast · Episode 3",
    badgeColor: "cyan" as const,
    title: "DeFi for ALL Investors",
    subtitle: "Why TurboLoop Works for Everyone",
    description:
      "CEO Dave breaks down how TurboLoop's 3-stream income model works for everyone — from first-time crypto users to experienced investors across every income level and background.",
    duration: "15 min",
    topics: ["3-Stream Income", "Beginner Friendly", "All Income Levels", "Global Access", "Passive Income", "DeFi Strategy"],
    quote: "\"You don't need to understand blockchain. You need to understand compound interest.\"",
    getVideo:     (l: VideoLanguage) => l.ep3video,
    getYoutube:   (l: VideoLanguage) => l.ep3youtubeUrl,
    getThumb:     (l: VideoLanguage) => l.ep3thumb ?? ENGLISH.ep3thumb ?? l.thumb ?? ENGLISH.thumb ?? "",
    getLangCount: () => LANGUAGES.filter(l => l.ep3video !== null).length,
  },
] as const;

type EpisodeId = "ep1" | "ep2" | "ep3";
type Episode = typeof EPISODES[number];

// ─── Badge colour helper ─────────────────────────────────────────────────────
function badgeClasses(color: "cyan" | "purple") {
  return color === "purple"
    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
    : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
}

// ─── PodcastPlayer ───────────────────────────────────────────────────────────
function PodcastPlayer({
  ep,
  defaultLocale,
}: {
  ep: Episode;
  defaultLocale: string;
}) {
  const [started, setStarted]           = useState(false);
  const [selectedLang, setSelectedLang] = useState<VideoLanguage>(() =>
    resolveInitialLang(defaultLocale, ep.id)
  );
  const [showPicker, setShowPicker]     = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Re-resolve when defaultLocale changes (e.g. SSR hydration)
  useEffect(() => {
    setSelectedLang(resolveInitialLang(defaultLocale, ep.id));
    setStarted(false);
  }, [defaultLocale, ep.id]);

  const activeVideo   = ep.getVideo(selectedLang)   ?? ep.getVideo(ENGLISH) ?? "";
  const activeYoutube = ep.getYoutube(selectedLang) ?? ep.getYoutube(ENGLISH);
  // Compute thumb reactively from selectedLang — this is the key fix
  const activeThumb   = ep.getThumb(selectedLang);
  const isAvailable   = (l: VideoLanguage) => ep.getVideo(l) !== null;
  const available     = LANGUAGES.filter(isAvailable);

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

  const handleLangSelect = (lang: VideoLanguage) => {
    if (!isAvailable(lang)) return;
    setSelectedLang(lang);
    setShowPicker(false);
    setStarted(false);
  };

  const handleShare = () => {
    const epTitle = ep.title + " — " + ep.subtitle;
    const text =
      `🎬 ${epTitle}\n\n${ep.description}\n\n🌍 Now available in ${selectedLang.label}` +
      (activeYoutube ? `\n\n▶️ Watch on YouTube:\n${activeYoutube}` : "") +
      `\n\n⬇️ Download (${selectedLang.label}):\n${activeVideo}` +
      "\n\n🔗 turboloop.tech/podcast";
    if (navigator.share) {
      navigator.share({ title: "TurboLoop Podcast", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => alert("Links copied!")).catch(() => {});
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/60 bg-[#0d1220]">
      {/* Video area */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {!started && (
          <div className="absolute inset-0">
            <img
              key={activeThumb}
              src={activeThumb}
              alt={ep.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center group"
              aria-label="Play video"
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                ep.badgeColor === "purple"
                  ? "bg-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.5)] group-hover:shadow-[0_0_60px_rgba(168,85,247,0.7)]"
                  : "bg-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.5)] group-hover:shadow-[0_0_60px_rgba(6,182,212,0.7)]"
              }`}>
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
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${badgeClasses(ep.badgeColor)}`}>
            EP {ep.num}
          </span>
        </div>
        {/* Language selector pill */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => setShowPicker(p => !p)}
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
            download={`TurboLoop-Podcast-Ep${ep.num}-${selectedLang.label}.mp4`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
        <p className="text-xs text-gray-600">
          AI-dubbed in {available.length} language{available.length !== 1 ? "s" : ""} — rolling out now.
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
  ep: Episode;
  defaultLocale: string;
}) {
  return (
    <section id={ep.id} className="scroll-mt-24">
      <div className="mb-6">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase border mb-4 ${badgeClasses(ep.badgeColor)}`}>
          {ep.badge}
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
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  ep.badgeColor === "purple"
                    ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                    : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                }`}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
        {/* Quote */}
        <div className={`rounded-xl border p-5 relative overflow-hidden ${
          ep.badgeColor === "purple"
            ? "border-purple-500/20 bg-purple-500/[0.05]"
            : "border-cyan-500/20 bg-cyan-500/[0.05]"
        }`}>
          <div className={`absolute top-3 left-4 text-5xl font-black opacity-10 leading-none ${
            ep.badgeColor === "purple" ? "text-purple-400" : "text-cyan-400"
          }`}>"</div>
          <p className={`relative z-10 text-sm sm:text-base font-medium leading-relaxed italic mt-3 ${
            ep.badgeColor === "purple" ? "text-purple-100" : "text-cyan-100"
          }`}>
            {ep.quote}
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
  const totalLangs = LANGUAGES.filter(l => l.video !== null).length;
  const [activeEp, setActiveEp] = useState<EpisodeId>("ep1");

  const scrollToEp = (id: EpisodeId) => {
    setActiveEp(id);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <main className="min-h-screen bg-[#080c14] text-white">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-20">
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
            The definitive DeFi podcast series — where TurboLoop's CEO answers the questions
            your bank hopes you never ask.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-10">
            <div className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-cyan-500" />
              <span><strong className="text-white">3</strong> Episodes</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span><strong className="text-white">56 min</strong> Total Runtime</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-cyan-500" />
              <span><strong className="text-white">{totalLangs}+</strong> Languages</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span><strong className="text-white">AI-Dubbed</strong> Every Episode</span>
            </div>
          </div>

          {/* ── Episode selector cards ──────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {EPISODES.map(ep => {
              const isActive = activeEp === ep.id;
              const langCount = ep.getLangCount();
              return (
                <button
                  key={ep.id}
                  onClick={() => scrollToEp(ep.id)}
                  className={`relative text-left rounded-2xl border p-5 transition-all duration-300 group ${
                    isActive
                      ? ep.badgeColor === "purple"
                        ? "border-purple-500/50 bg-purple-500/[0.08] shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                        : "border-cyan-500/50 bg-cyan-500/[0.08] shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  }`}
                >
                  {isActive && (
                    <div className={`absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse ${
                      ep.badgeColor === "purple" ? "bg-purple-400" : "bg-cyan-400"
                    }`} />
                  )}
                  <div className={`text-xs font-bold tracking-widest uppercase mb-3 ${
                    isActive
                      ? ep.badgeColor === "purple" ? "text-purple-400" : "text-cyan-400"
                      : "text-gray-600"
                  }`}>
                    Episode {ep.num}
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
                    <div className={`mt-4 flex items-center gap-1.5 text-xs font-semibold ${
                      ep.badgeColor === "purple" ? "text-purple-400" : "text-cyan-400"
                    }`}>
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

      {/* ── All Episodes ──────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-20">

        {EPISODES.map((ep, i) => (
          <div key={ep.id}>
            {i > 0 && (
              <div className="flex items-center gap-4 mb-12">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-gray-600 uppercase tracking-widest font-semibold">Episode {ep.num}</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
            )}
            <EpisodeSection ep={ep} defaultLocale={locale} />
          </div>
        ))}

        {/* Coming Soon */}
        <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6 flex items-center gap-4 opacity-50">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/[0.03] shrink-0">
            <Lock className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-500 text-sm">Episode 4</div>
            <div className="text-xs text-gray-700 mt-0.5">Coming Soon — Stay tuned</div>
          </div>
          <div className="ml-auto">
            <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] text-gray-600 font-semibold uppercase tracking-wider">
              Coming Soon
            </span>
          </div>
        </div>

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
              href="/library"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-gray-300 font-semibold text-sm hover:bg-white/[0.05] transition"
            >
              Download Presentation
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
