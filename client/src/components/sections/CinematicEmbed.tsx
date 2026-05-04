// Reusable inline 16:9 cinematic film embed for cross-page placement.
// Renders a poster + play overlay; click → opens fullscreen CinematicLightbox.
//
// Used on Home, Security, Community, Feed, and 6 ecosystem pillar pages.

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { type Film, getFilm, SEASONS } from "@/lib/cinematicUniverse";
import { isMobileViewport, playInFullscreen } from "@/lib/videoFullscreen";
import CinematicLightbox from "./CinematicLightbox";

interface Props {
  /** The film slug to embed (e.g. "what-is-turboloop") */
  slug: string;
  /** Optional surrounding label — appears as a small ribbon above the player */
  label?: string;
  /** Optional override for the title shown next to the player */
  pretitle?: string;
  /** Compact mode: smaller layout, no side info */
  compact?: boolean;
}

export default function CinematicEmbed({
  slug,
  label,
  pretitle,
  compact = false,
}: Props) {
  const film = getFilm(slug);
  const [activeFilm, setActiveFilm] = useState<Film | null>(null);

  if (!film) return null;
  const season = SEASONS[film.season];

  return (
    <>
      <section className={compact ? "py-6" : "py-12 md:py-16"}>
        <div className="container max-w-5xl">
          {label && (
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" style={{ color: season.accent }} />
              <span
                className="text-[11px] font-bold tracking-[0.25em] uppercase"
                style={{ color: season.accent }}
              >
                {label}
              </span>
            </div>
          )}

          {!compact && pretitle && (
            <h3
              className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {pretitle}
            </h3>
          )}

          <motion.button
            onClick={() => {
              // Mobile: skip the lightbox modal (URL bar fights it). Go
              // straight to native fullscreen — phone hides browser chrome,
              // video uses 100% of the screen, native scrub controls.
              // Desktop: open the lightbox with side panel + episode nav.
              if (isMobileViewport()) {
                playInFullscreen({ url: film.url, title: film.title });
              } else {
                setActiveFilm(film);
              }
            }}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="group relative w-full rounded-2xl overflow-hidden cursor-pointer block"
            style={{
              aspectRatio: "16 / 9",
              boxShadow: `0 18px 50px -12px ${season.accent}30, 0 8px 24px -8px rgba(0,0,0,0.15)`,
              border: `1px solid ${season.accent}20`,
            }}
            aria-label={`Play ${film.title}`}
          >
            {/* Poster */}
            <img
              src={film.posterUrl}
              alt={film.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Vibrant gradient floor */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(180deg, transparent 30%, ${season.accent}15 60%, rgba(0,0,0,0.55) 100%)`,
              }}
            />

            {/* Top-left season pill */}
            <div
              className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-md flex items-center gap-2"
              style={{
                background: "rgba(15,23,42,0.7)",
                color: "white",
                border: `1px solid ${season.accent}50`,
              }}
            >
              <span>{season.emoji}</span>
              <span>
                S{film.season} · E{film.episode}
              </span>
            </div>

            {/* Top-right "FILM" pill */}
            <div
              className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.25em] uppercase backdrop-blur-md"
              style={{
                background: "rgba(255,255,255,0.95)",
                color: season.accent,
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              }}
            >
              ▸ Film
            </div>

            {/* Center play button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle, ${season.accent}55, transparent 70%)`,
                    transform: "scale(2.2)",
                  }}
                />
                <div
                  className="relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: "linear-gradient(135deg, #ffffff, #f1f5f9)",
                    boxShadow: `0 12px 30px rgba(0,0,0,0.5), 0 0 0 5px ${season.accent}30, inset 0 1px 0 rgba(255,255,255,0.6)`,
                  }}
                >
                  <Play
                    className="w-8 h-8 md:w-10 md:h-10 ml-1 fill-current"
                    style={{ color: season.accent }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom info strip */}
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-left">
              <div
                className="text-xs md:text-sm font-bold tracking-wide opacity-95 mb-1"
                style={{
                  color:
                    season.accent === "#0891B2" ? "#22D3EE" : season.accent,
                }}
              >
                {film.headline}
              </div>
              <h4 className="text-lg md:text-2xl font-bold text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                {film.title}
              </h4>
              {!compact && (
                <p className="text-sm text-white/85 mt-1 line-clamp-1 drop-shadow">
                  {film.tagline}
                </p>
              )}
            </div>
          </motion.button>
        </div>
      </section>

      <CinematicLightbox
        film={activeFilm}
        onClose={() => setActiveFilm(null)}
        onSelectFilm={setActiveFilm}
      />
    </>
  );
}
