// Premium fullscreen lightbox for the TurboLoop Cinematic Universe.
// 16:9 landscape player (vs the 9:16 reel player) with:
//   - Native HTML5 video controls (scrub, fullscreen, captions, quality)
//   - Side panel with headline + tagline + writeup body + share + download
//   - "Up next" thumbnail of the next episode in the season for chain-watch
//   - Keyboard: Esc to close, ← / → to navigate within season

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, Loader2, Play, ArrowRight } from "lucide-react";
import { type Film, getNextFilm, getPrevFilm, SEASONS } from "@/lib/cinematicUniverse";
import ShareButton from "@/components/ShareButton";

async function downloadFilm(videoUrl: string, title: string) {
  try {
    const res = await fetch(videoUrl);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    const safeName = title.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_").slice(0, 80);
    a.download = `TurboLoop_${safeName}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    window.open(videoUrl, "_blank", "noopener,noreferrer");
  }
}

interface Props {
  film: Film | null;
  onClose: () => void;
  onSelectFilm: (film: Film) => void;
}

export default function CinematicLightbox({ film, onClose, onSelectFilm }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);

  const next = film ? getNextFilm(film.slug) : undefined;
  const prev = film ? getPrevFilm(film.slug) : undefined;
  const season = film ? SEASONS[film.season] : null;

  useEffect(() => {
    if (!film) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && next) onSelectFilm(next);
      else if (e.key === "ArrowLeft" && prev) onSelectFilm(prev);
    };
    window.addEventListener("keydown", onKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [film, next, prev, onClose, onSelectFilm]);

  // Reset loading state when film changes
  useEffect(() => {
    if (film) setLoading(true);
  }, [film?.slug]);

  return (
    <AnimatePresence>
      {film && season && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col"
          onClick={onClose}
        >
          {/* Top bar */}
          <div
            className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 md:p-6 pointer-events-none"
          >
            <div className="flex items-center gap-3 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <div
                className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.18em] uppercase backdrop-blur-md flex items-center gap-2"
                style={{
                  background: `${season.accent}25`,
                  color: "white",
                  border: `1px solid ${season.accent}50`,
                }}
              >
                <span>{season.emoji}</span>
                <span>S{film.season} · E{film.episode}</span>
              </div>
              <span className="hidden md:block text-white/85 text-sm font-semibold tracking-wide max-w-md truncate">
                {film.title}
              </span>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="pointer-events-auto group flex items-center gap-2 pl-3 pr-5 py-3 rounded-full bg-white hover:bg-red-50 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-200 hover:scale-105"
              aria-label="Close (Esc)"
            >
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg group-hover:from-red-600 group-hover:to-red-700 transition">
                <X className="w-4 h-4 text-white" strokeWidth={3} />
              </span>
              <span className="text-slate-800 text-sm font-bold">Close</span>
            </button>
          </div>

          {/* Side nav arrows */}
          {prev && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelectFilm(prev); }}
              className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center transition z-20"
              aria-label={`Previous: ${prev.title}`}
              title={`← ${prev.title}`}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          {next && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelectFilm(next); }}
              className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center transition z-20"
              aria-label={`Next: ${next.title}`}
              title={`${next.title} →`}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Main content — video left, info right */}
          <div className="flex-1 flex flex-col lg:flex-row items-stretch justify-center pt-20 md:pt-24 pb-6 md:pb-8 px-4 md:px-12 gap-6 md:gap-8 overflow-hidden">
            {/* Video */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center min-h-0"
            >
              <motion.div
                key={film.slug}
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl"
                style={{
                  aspectRatio: "16 / 9",
                  maxHeight: "calc(100vh - 200px)",
                  maxWidth: "min(1280px, 100%)",
                }}
              >
                <video
                  ref={videoRef}
                  src={film.url}
                  poster={film.posterUrl}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  onCanPlay={() => setLoading(false)}
                  onWaiting={() => setLoading(true)}
                  onPlaying={() => setLoading(false)}
                  className="w-full h-full object-contain"
                />
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                    <Loader2 className="w-12 h-12 text-white/80 animate-spin" />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Side panel — info + actions + up-next */}
            <aside
              onClick={(e) => e.stopPropagation()}
              className="w-full lg:w-[380px] xl:w-[420px] shrink-0 overflow-y-auto rounded-2xl p-5 md:p-6 text-white"
              style={{
                background: "rgba(15,23,42,0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2"
                style={{ color: season.accent }}
              >
                {season.emoji} {season.name}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                {film.title}
              </h2>
              <div className="text-base md:text-lg font-semibold mb-3 opacity-95" style={{ color: season.accent }}>
                {film.headline}
              </div>
              <div className="text-sm font-medium opacity-80 italic mb-4 leading-relaxed">
                {film.tagline}
              </div>
              <p className="text-sm leading-relaxed opacity-90 mb-6">{film.description}</p>

              {/* Action row */}
              <div className="flex flex-wrap gap-2 mb-5">
                <ShareButton
                  path={`/films/${film.slug}`}
                  message={`🎬 ${film.title}\n\n${film.tagline}\n\nWatch on Turbo Loop:`}
                  label="Share"
                  className="!bg-white/10 hover:!bg-white/20 !text-white !border-white/15 !text-xs"
                />
                <button
                  onClick={() => downloadFilm(film.url, film.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download MP4
                </button>
              </div>

              {/* Up next */}
              {next && (
                <button
                  onClick={() => onSelectFilm(next)}
                  className="group block w-full text-left rounded-xl overflow-hidden transition hover:scale-[1.02]"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-60 px-3 pt-3">
                    ▸ Up next — S{next.season} · E{next.episode}
                  </div>
                  <div className="flex items-center gap-3 p-3">
                    <div className="relative w-20 h-12 rounded-md overflow-hidden bg-slate-800 shrink-0">
                      <img
                        src={next.posterUrl}
                        alt={next.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold leading-tight line-clamp-2 group-hover:text-cyan-300 transition">
                        {next.title}
                      </div>
                      <div className="text-xs opacity-60 mt-1 line-clamp-1">{next.tagline}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition" />
                  </div>
                </button>
              )}
            </aside>
          </div>

          {/* Bottom hint */}
          <div className="absolute bottom-2 left-0 right-0 text-center text-white/30 text-[10px] tracking-wider uppercase pointer-events-none">
            Esc to close · ← → to switch episodes · Click side panel to interact
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
