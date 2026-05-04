// /films — TurboLoop Cinematic Universe hub.
// 4 seasons × 5 episodes = 20 films, season-grouped, click any card → fullscreen lightbox.

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import PageShell from "@/components/PageShell";
import AnimatedSection from "@/components/AnimatedSection";
import CinematicLightbox from "@/components/sections/CinematicLightbox";
import {
  FILMS,
  SEASONS,
  getFilmsBySeason,
  type Film,
  type Season,
} from "@/lib/cinematicUniverse";

interface FilmsPageProps {
  /** Optional auto-open film on mount — used by FilmPlayer (/films/:slug) */
  autoOpenSlug?: string;
}

/**
 * Mobile-first premium video playback: tapping a film card on mobile bypasses
 * the desktop lightbox modal entirely and goes STRAIGHT to native fullscreen.
 * This is what YouTube / Netflix / Apple TV do on phones — the URL bar
 * disappears, the video uses 100% of the actual screen, native scrub controls.
 *
 * Must be called synchronously from the click handler so the user gesture
 * context is still alive when we call requestFullscreen / webkitEnterFullscreen
 * (browsers reject these APIs without an active gesture).
 *
 * Cleanup: when the user exits fullscreen (back button / exit-fullscreen tap)
 * the temporary video element is removed and they're back on the films page.
 */
function playFilmInFullscreen(film: Film): void {
  const v = document.createElement("video");
  v.src = film.url;
  v.controls = true;
  v.autoplay = true;
  v.preload = "auto";
  // playsInline lets iOS try inline first; we still call webkitEnterFullscreen
  // explicitly to force the native player overlay
  v.playsInline = true;
  v.setAttribute("title", film.title);
  // Hide the temp element from page flow when not in fullscreen
  v.style.position = "fixed";
  v.style.inset = "0";
  v.style.width = "100%";
  v.style.height = "100%";
  v.style.background = "black";
  v.style.zIndex = "10000";
  document.body.appendChild(v);

  const cleanup = () => {
    try {
      v.pause();
    } catch {}
    v.remove();
    document.removeEventListener("fullscreenchange", onFsChange);
    (document as any).removeEventListener?.(
      "webkitfullscreenchange",
      onFsChange
    );
    v.removeEventListener("ended", cleanup);
    v.removeEventListener("webkitendfullscreen" as any, cleanup);
  };
  const onFsChange = () => {
    const fsEl =
      document.fullscreenElement || (document as any).webkitFullscreenElement;
    if (!fsEl) cleanup();
  };
  document.addEventListener("fullscreenchange", onFsChange);
  (document as any).addEventListener?.("webkitfullscreenchange", onFsChange);
  v.addEventListener("ended", cleanup);
  // iOS Safari: native player exit fires this event
  v.addEventListener("webkitendfullscreen" as any, cleanup);

  // Start playback (browser may need this before fullscreen)
  v.play().catch(() => {});

  // Try standard fullscreen API first (Android Chrome, modern desktop)
  const tryStandardFs = (v as any).requestFullscreen;
  // iOS Safari: proprietary API on the <video> element
  const tryWebkitFs = (v as any).webkitEnterFullscreen;

  if (typeof tryStandardFs === "function") {
    tryStandardFs.call(v, { navigationUI: "hide" }).catch(() => {
      // Standard rejected — try webkit fallback (older iOS)
      if (typeof tryWebkitFs === "function") {
        v.addEventListener("loadedmetadata", () => tryWebkitFs.call(v), {
          once: true,
        });
      }
    });
  } else if (typeof tryWebkitFs === "function") {
    // iOS Safari needs metadata loaded before fullscreen
    if (v.readyState >= 1) {
      tryWebkitFs.call(v);
    } else {
      v.addEventListener("loadedmetadata", () => tryWebkitFs.call(v), {
        once: true,
      });
    }
  } else {
    // No fullscreen API available — leave the inline overlay as-is.
    // User can use the close gesture (we add a tap-anywhere-to-close listener).
    v.addEventListener("click", cleanup);
  }
}

function isMobileViewport(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches
  );
}

export default function FilmsPage({ autoOpenSlug }: FilmsPageProps = {}) {
  const initialFilm = autoOpenSlug
    ? FILMS.find(f => f.slug === autoOpenSlug) || null
    : null;
  const [activeFilm, setActiveFilm] = useState<Film | null>(initialFilm);

  // Click handler: on mobile, go STRAIGHT to native fullscreen (bypass the
  // lightbox modal entirely — the inline player fights with the URL bar).
  // On desktop, use the existing lightbox with side panel + episode nav.
  const handleSelectFilm = (film: Film) => {
    if (isMobileViewport()) {
      playFilmInFullscreen(film);
    } else {
      setActiveFilm(film);
    }
  };

  const seasons: Season[] = [1, 2, 3, 4];

  return (
    <PageShell
      title="The TurboLoop Cinematic Universe"
      description="20 short films across 4 seasons — from The Problem to The Movement. The TurboLoop story, in cinema."
      path="/films"
      hero={{
        label: "Cinematic Universe · 4 Seasons · 20 Films",
        heading: "The story, in 20 films.",
        subtitle:
          "From The Problem to The Movement — watch the system being rewritten, season by season.",
        palette: ["#0F172A", "#7C3AED", "#22D3EE"],
        emoji: "🎬",
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "TurboLoop Cinematic Universe",
        url: "https://turboloop.tech/films",
        description:
          "20 films across 4 seasons covering the full TurboLoop story.",
        hasPart: FILMS.map(f => ({
          "@type": "VideoObject",
          name: f.title,
          description: f.description,
          thumbnailUrl: f.posterUrl,
          contentUrl: f.url,
          uploadDate: "2026-04-29",
          url: `https://turboloop.tech/films/${f.slug}`,
        })),
      }}
      related={[
        {
          label: "Editorial (Blog)",
          href: "/feed",
          emoji: "📖",
          description: "13 long-form deep-dives — May–June",
        },
        {
          label: "Library",
          href: "/library",
          emoji: "📚",
          description: "Reels, presentations, all videos",
        },
        {
          label: "Creatives",
          href: "/creatives",
          emoji: "🎨",
          description: "141 banners with captions in 48 languages",
        },
      ]}
    >
      <div className="container pb-16">
        {/* Watch all CTA */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <button
              onClick={() => handleSelectFilm(FILMS[0])}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                color: "white",
                boxShadow: "0 12px 30px -8px rgba(8,145,178,0.5)",
              }}
            >
              <Play className="w-4 h-4 fill-white" />
              Watch all 20 films from S1·E1
            </button>
            <div className="text-xs text-slate-500 mt-3">
              ~30-90 seconds each · English · Free · No login
            </div>
          </div>
        </AnimatedSection>

        {/* Seasons */}
        <div className="space-y-12 md:space-y-16">
          {seasons.map(s => (
            <SeasonRow key={s} season={s} onSelectFilm={handleSelectFilm} />
          ))}
        </div>
      </div>

      <CinematicLightbox
        film={activeFilm}
        onClose={() => setActiveFilm(null)}
        onSelectFilm={handleSelectFilm}
      />
    </PageShell>
  );
}

function SeasonRow({
  season,
  onSelectFilm,
}: {
  season: Season;
  onSelectFilm: (f: Film) => void;
}) {
  const info = SEASONS[season];
  const films = getFilmsBySeason(season);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <AnimatedSection>
      <section>
        {/* Season ribbon */}
        <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <div
              className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2"
              style={{ color: info.accent }}
            >
              {info.emoji} {info.name.split(" — ")[0]}
            </div>
            <h2
              className="text-2xl md:text-4xl font-bold text-slate-900 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {info.name.split(" — ")[1]}
            </h2>
            <p className="text-sm md:text-base text-slate-500 mt-2 max-w-2xl leading-relaxed">
              {info.theme}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={() => scroll(-400)}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:border-slate-400 transition flex items-center justify-center"
              aria-label={`Scroll ${info.name} left`}
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={() => scroll(400)}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:border-slate-400 transition flex items-center justify-center"
              aria-label={`Scroll ${info.name} right`}
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Episode cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {films.map((film, i) => (
            <EpisodeCard
              key={film.slug}
              film={film}
              index={i}
              accent={info.accent}
              onClick={() => onSelectFilm(film)}
            />
          ))}
        </div>
      </section>
    </AnimatedSection>
  );
}

function EpisodeCard({
  film,
  index,
  accent,
  onClick,
}: {
  film: Film;
  index: number;
  accent: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
      onClick={onClick}
      whileHover={{ y: -4 }}
      className="group relative shrink-0 snap-start text-left rounded-2xl overflow-hidden cursor-pointer"
      style={{
        width: "min(360px, calc(100vw - 2rem))",
        aspectRatio: "16 / 9",
        boxShadow: `0 12px 32px -10px ${accent}40, 0 4px 14px -4px rgba(0,0,0,0.1)`,
      }}
    >
      {/* Poster */}
      <img
        src={film.posterUrl}
        alt={film.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Gradient floor */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, transparent 30%, ${accent}10 55%, rgba(0,0,0,0.7) 100%)`,
        }}
      />

      {/* Episode badge */}
      <div
        className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase backdrop-blur-md"
        style={{
          background: "rgba(15,23,42,0.65)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        E{film.episode}
      </div>

      {/* Play overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{
            background: "linear-gradient(135deg, #ffffff, #f1f5f9)",
            boxShadow: `0 8px 24px rgba(0,0,0,0.45), 0 0 0 4px ${accent}30`,
          }}
        >
          <Play
            className="w-5 h-5 ml-0.5 fill-current"
            style={{ color: accent }}
          />
        </div>
      </div>

      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
        <h3 className="text-sm md:text-base font-bold leading-tight line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
          {film.title}
        </h3>
        <div className="text-[11px] text-white/80 mt-0.5 line-clamp-1">
          {film.tagline}
        </div>
      </div>
    </motion.button>
  );
}
