"use client";

// ─────────────────────────────────────────────────────────────────────────────
// VideoExplainerSection — Homepage video section
//
// ✅  FULLY DATA-DRIVEN — no hardcoded episode blocks.
//     To add a new episode: edit next-app/lib/episodes.config.ts only.
//     This component loops over EPISODES automatically.
//
// ✅  Language data lives in: next-app/lib/videoLanguages.ts
//     Do not copy LANGUAGES into this file.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from "react";
import { Play, Globe, ChevronDown, Download, Youtube, Share2 } from "lucide-react";
import { LANGUAGES, ENGLISH, LOCALE_TO_VIDEO_CODE, type VideoLanguage } from "@/lib/videoLanguages";
import { EPISODES, BADGE_COLORS, type EpisodeConfig } from "@/lib/episodes.config";

function resolveInitialLang(locale?: string): VideoLanguage {
  if (!locale || locale === "en") return ENGLISH;
  const videoCode = LOCALE_TO_VIDEO_CODE[locale] ?? null;
  if (!videoCode) return ENGLISH;
  const match = LANGUAGES.find(l => l.code === videoCode && l.episodes.ep1?.video !== null);
  return match ?? ENGLISH;
}

// ─────────────────────────────────────────────────────────────────────────────
// VideoPlayer — renders a single episode player for any episode ID
// ─────────────────────────────────────────────────────────────────────────────
function VideoPlayer({
  defaultLocale,
  episodeConfig,
}: {
  defaultLocale?: string;
  episodeConfig: EpisodeConfig;
}) {
  const epId = episodeConfig.id;
  const [started, setStarted] = useState(false);
  const [selectedLang, setSelectedLang] = useState(() => resolveInitialLang(defaultLocale));
  const [showPicker, setShowPicker] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getEpData = (lang: VideoLanguage) => lang.episodes[epId] ?? null;
  const isAvailable = (lang: VideoLanguage) => (getEpData(lang)?.video ?? null) !== null;

  const activeEpData = getEpData(selectedLang)?.video ? getEpData(selectedLang)! : getEpData(ENGLISH)!;
  const activeVideo = activeEpData.video!;
  const activeThumb = activeEpData.thumb ?? getEpData(ENGLISH)?.thumb ?? ENGLISH.episodes.ep1?.thumb ?? "";
  const activeYoutubeUrl = activeEpData.youtubeUrl ?? getEpData(ENGLISH)?.youtubeUrl ?? null;
  const availableCount = LANGUAGES.filter(isAvailable).length;

  const badgeColors = BADGE_COLORS[episodeConfig.badgeColor] ?? BADGE_COLORS.cyan;

  const handleLangSelect = (lang: VideoLanguage) => {
    if (!isAvailable(lang)) return;
    setSelectedLang(lang);
    setShowPicker(false);
    setStarted(false);
  };

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

  // Play button color — use badge color accent
  const playBtnClass =
    episodeConfig.badgeColor === "violet"  ? "bg-violet-500 shadow-violet-500/40" :
    episodeConfig.badgeColor === "amber"   ? "bg-amber-500 shadow-amber-500/40" :
    episodeConfig.badgeColor === "emerald" ? "bg-emerald-500 shadow-emerald-500/40" :
    episodeConfig.badgeColor === "rose"    ? "bg-rose-500 shadow-rose-500/40" :
    episodeConfig.badgeColor === "blue"    ? "bg-blue-500 shadow-blue-500/40" :
    episodeConfig.badgeColor === "pink"    ? "bg-pink-500 shadow-pink-500/40" :
    "bg-cyan-500 shadow-cyan-500/40";

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/60 bg-[#0d1220]">
      {/* Video area — 16:9 */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {!started && (
          <div className="absolute inset-0 w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeThumb}
              src={activeThumb}
              alt={`${selectedLang.label} ${episodeConfig.title} thumbnail`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <video
          ref={videoRef}
          key={activeVideo}
          src={activeVideo}
          className={`absolute inset-0 w-full h-full object-cover bg-black ${started ? "opacity-100" : "opacity-0"}`}
          preload="metadata"
          playsInline
          controls={started}
          controlsList="nodownload"
          onEnded={() => setStarted(false)}
        />

        {!started && (
          <button
            onClick={handlePlay}
            aria-label="Play video"
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors group"
          >
            <span className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full shadow-xl ${playBtnClass} group-hover:scale-105 transition-transform`}>
              <Play className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white ml-1" fill="white" />
            </span>
          </button>
        )}

        {/* Language selector */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/70 border border-white/15 text-xs text-white backdrop-blur-md hover:bg-black/90 transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="max-w-[80px] truncate">{selectedLang.flag} {selectedLang.nativeLabel}</span>
            <ChevronDown className={`w-3 h-3 text-gray-400 shrink-0 transition-transform ${showPicker ? "rotate-180" : ""}`} />
          </button>

          {showPicker && (
            <div className="absolute top-full right-0 mt-2 w-60 max-h-72 overflow-y-auto rounded-xl bg-[#0d1220] border border-white/10 shadow-2xl z-30">
              <div className="sticky top-0 px-3 py-2 bg-[#0d1220] border-b border-white/10">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  {availableCount} of {LANGUAGES.length} available · more coming soon
                </p>
              </div>
              {LANGUAGES.map((lang) => {
                const available = isAvailable(lang);
                const active = selectedLang.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLangSelect(lang)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left
                      ${active ? `${badgeColors.bg} ${badgeColors.text}` : "text-gray-300 hover:bg-white/5"}
                      ${!available ? "opacity-50 cursor-default" : ""}
                    `}
                    disabled={!available}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="flex-1 truncate">{lang.nativeLabel}</span>
                    {!available && (
                      <span className="text-[10px] text-gray-600 italic shrink-0">soon</span>
                    )}
                    {active && available && (
                      <span className={`w-1.5 h-1.5 rounded-full ${badgeColors.text.replace("text-", "bg-")} shrink-0`} />
                    )}
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
              {selectedLang.label} · {episodeConfig.duration} · Full HD
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08]">SolidityScan 99.99</span>
            <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08]">HazeCrypto Audited</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {activeYoutubeUrl && (
            <a
              href={activeYoutubeUrl}
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
            download={`TurboLoop-${episodeConfig.title.replace(/[^a-z0-9]/gi, "-")}-${selectedLang.label}.mp4`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
          <button
            onClick={() => {
              const text = `🎬 ${episodeConfig.title} — ${episodeConfig.subtitle}\n\n${episodeConfig.description}\n\n🌍 Now available in ${selectedLang.label}`
                + (activeYoutubeUrl ? `\n\n▶️ Watch on YouTube:\n${activeYoutubeUrl}` : "")
                + `\n\n⬇️ Download (${selectedLang.label}):\n${activeVideo}`
                + "\n\n🔗 turboloop.tech";
              if (navigator.share) {
                navigator.share({ title: "TurboLoop", text }).catch(() => {});
              } else {
                navigator.clipboard.writeText(text).then(() => alert("Links copied to clipboard!")).catch(() => {});
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main exported section — loops over EPISODES automatically
// ─────────────────────────────────────────────────────────────────────────────
export function VideoExplainerSection({ defaultLocale }: { defaultLocale?: string } = {}) {
  return (
    <section className="relative py-16 md:py-24 bg-[#080c14] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {EPISODES.map((ep, idx) => {
          const badgeColors = BADGE_COLORS[ep.badgeColor] ?? BADGE_COLORS.cyan;
          const availableCount = LANGUAGES.filter(l => (l.episodes[ep.id]?.video ?? null) !== null).length;
          const isFirst = idx === 0;

          return (
            <div key={ep.id}>
              {/* Divider between episodes */}
              {!isFirst && (
                <div className="flex items-center gap-4 mb-16">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-xs text-gray-600 uppercase tracking-widest font-semibold">Turbo Podcast</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
              )}

              <div id={ep.id}>
                <div className="text-center mb-8 sm:mb-10">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase ${badgeColors.bg} ${badgeColors.text} border ${badgeColors.border} mb-4`}>
                    {ep.badgeLabel}
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
                    {isFirst ? "See How TurboLoop Works" : ep.title}
                  </h2>
                  <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                    {ep.description}
                  </p>
                </div>
                <VideoPlayer defaultLocale={defaultLocale} episodeConfig={ep} />
                <p className="text-center text-xs text-gray-600 mt-4">
                  English Original · AI-Dubbed in {availableCount} language{availableCount !== 1 ? "s" : ""} — rolling out now.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
