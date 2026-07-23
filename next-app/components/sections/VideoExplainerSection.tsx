"use client";

// ─────────────────────────────────────────────────────────────────────────────
// VideoExplainerSection — Homepage video section with Episode 1 + Episode 2
//
// ⚠️  ALL LANGUAGE/EPISODE DATA lives in:
//       next-app/lib/videoLanguages.ts
//     Edit that file to add languages, YouTube links, or ep2 video URLs.
//     DO NOT copy the LANGUAGES array back into this file.
//
// ⚠️  DO NOT remove the Episode 2 block at the bottom of this component.
//     It is a permanent feature. See videoLanguages.ts for data.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from "react";
import { Play, Globe, ChevronDown, Download, Youtube } from "lucide-react";
import { LANGUAGES, ENGLISH, LOCALE_TO_VIDEO_CODE, type VideoLanguage } from "@/lib/videoLanguages";

function resolveInitialLang(locale?: string): VideoLanguage {
  if (!locale || locale === "en") return ENGLISH;
  const videoCode = LOCALE_TO_VIDEO_CODE[locale] ?? null;
  if (!videoCode) return ENGLISH;
  const match = LANGUAGES.find(l => l.code === videoCode && l.video !== null);
  return match ?? ENGLISH;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared VideoPlayer sub-component (used for both Episode 1 and Episode 2)
// ─────────────────────────────────────────────────────────────────────────────
function VideoPlayer({
  defaultLocale,
  episode,
}: {
  defaultLocale?: string;
  episode: "ep1" | "ep2";
}) {
  const [started, setStarted] = useState(false);
  const [selectedLang, setSelectedLang] = useState(() => resolveInitialLang(defaultLocale));
  const [showPicker, setShowPicker] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getVideo = (lang: VideoLanguage) =>
    episode === "ep1" ? lang.video : lang.ep2video;
  const getYoutubeUrl = (lang: VideoLanguage) =>
    episode === "ep1" ? lang.youtubeUrl : lang.ep2youtubeUrl;

  const activeVideo = getVideo(selectedLang) ?? getVideo(ENGLISH)!;
  const activeThumb = selectedLang.thumb ?? ENGLISH.thumb!;
  const activeYoutubeUrl = getYoutubeUrl(selectedLang) ?? getYoutubeUrl(ENGLISH);
  const isAvailable = (lang: VideoLanguage) => getVideo(lang) !== null;
  const availableCount = LANGUAGES.filter(isAvailable).length;

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

  const duration = episode === "ep1" ? "20 min" : "21 min";

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/60 bg-[#0d1220]">
      {/* Video area — 16:9 */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {!started && (
          <div className="absolute inset-0 w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeThumb}
              alt={`${selectedLang.label} explainer thumbnail`}
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
            <span className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-cyan-500 shadow-xl shadow-cyan-500/40 group-hover:scale-105 transition-transform">
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
                      ${active ? "bg-cyan-500/10 text-cyan-400" : "text-gray-300 hover:bg-white/5"}
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
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white/[0.03] border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
          <span className="text-sm text-gray-400">
            {selectedLang.label} · {duration} · Full HD
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08]">SolidityScan 99.99</span>
          <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08]">HazeCrypto Audited</span>
          {activeYoutubeUrl && (
            <a
              href={activeYoutubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
              title={`Watch ${selectedLang.label} version on YouTube`}
            >
              <Youtube className="w-3 h-3" />
              <span>YouTube</span>
            </a>
          )}
          <a
            href={activeVideo}
            download={`TurboLoop-${episode === "ep1" ? "Explainer" : "Podcast-Ep2"}-${selectedLang.label}.mp4`}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
            title={`Download ${selectedLang.label} version`}
          >
            <Download className="w-3 h-3" />
            <span>Download</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main exported section
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

        {/* ── Episode 1 ─────────────────────────────────────────────── */}
        <div>
          <div className="text-center mb-8 sm:mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              Deep Dive · Episode 1
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
              See How TurboLoop Works
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              A 20-minute breakdown covering security audits, smart contract architecture,
              and how your USDT earns fixed returns on BNB Smart Chain.
            </p>
          </div>
          <VideoPlayer defaultLocale={defaultLocale} episode="ep1" />
          <p className="text-center text-xs text-gray-600 mt-4">
            AI-dubbed versions in {LANGUAGES.filter(l => l.video !== null).length} languages — rolling out now.
          </p>
        </div>

        {/* ── Divider ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-xs text-gray-600 uppercase tracking-widest font-semibold">Turbo Podcast</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* ── Episode 2 — DO NOT REMOVE ─────────────────────────────── */}
        <div>
          <div className="text-center mb-8 sm:mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
              Turbo Podcast · Episode 2
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
              Is TurboLoop Legit?
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              CEO Dave answers 19 tough community questions on revenue sustainability,
              smart contract security, on-chain verification, and the $100K bug bounty challenge.
            </p>
          </div>
          <VideoPlayer defaultLocale={defaultLocale} episode="ep2" />
          <p className="text-center text-xs text-gray-600 mt-4">
            AI-dubbed versions in {LANGUAGES.filter(l => l.ep2video !== null).length} languages — rolling out now.
          </p>
        </div>

      </div>
    </section>
  );
}
