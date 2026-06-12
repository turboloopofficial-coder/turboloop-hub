// FilmCard — the unified card component for films on the /films page.
//
// Renders one DbFilm with:
//   - 16:9 poster (Image, lazy-loaded except above-the-fold)
//   - Gradient overlay + play-icon (visible on hover; always-on on touch)
//   - Optional episode badge (S1·E1, V01, etc.)
//   - NEW badge if shouldShowNewBadge() returns true
//   - Title, headline (per-language tagline / accent text), description preview
//   - Click navigates to /films/[canonicalSlug]?lang=<lang>
//
// Tap target: the entire card is a single <Link> so mobile users have
// the whole 16:9 + body region as the hit area (≥44×44 always).
//
// Hover/focus: tl-film-card class in globals.css handles the subtle
// translate-Y + glow + ring effect. Respects prefers-reduced-motion.
//
// Accent color comes from the caller (season info or block info) so
// the same component works for both Sovereign Series (block-tinted)
// and Cinematic Universe (season-tinted) sections.

import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { NewBadge } from "@components/ui/NewBadge";
import {
  shouldShowNewBadge,
  type DbFilm,
  type FilmLang,
} from "@lib/filmsApi";

interface FilmCardProps {
  film: DbFilm;
  activeLang: FilmLang;
  /** Hex color for accent text + play-icon tint. Pass the season or
   *  block accent so the card visually slots into its grouping. */
  accent: string;
  /** Show the small label in the top-left corner ("S1·E1" / "V07"). */
  showEpisodeBadge?: boolean;
  /** Override the default label calculation when the caller wants
   *  something specific (e.g. "V07" instead of "S5·E2"). */
  episodeLabel?: string;
  /** Pass priority=true for above-the-fold cards (hero + first row) to
   *  let Next.js preload the poster. Default false (lazy). */
  priority?: boolean;
}

export function FilmCard({
  film,
  activeLang,
  accent,
  showEpisodeBadge = false,
  episodeLabel,
  priority = false,
}: FilmCardProps) {
  const detailHref =
    activeLang === "en"
      ? `/films/${film.canonicalSlug}`
      : `/films/${film.canonicalSlug}?lang=${activeLang}`;

  const showNew = shouldShowNewBadge(film);
  const defaultLabel =
    film.season && film.episode
      ? `S${film.season}·E${film.episode}`
      : null;
  const label = episodeLabel ?? defaultLabel;

  return (
    <Link
      href={detailHref}
      className="tl-film-card group relative block rounded-[var(--r-xl)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-md)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-brand-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--c-bg)]"
    >
      {/* Poster — 16:9 */}
      <div
        className="relative w-full bg-[var(--c-bg)]"
        style={{ aspectRatio: "16 / 9" }}
      >
        {film.posterUrl ? (
          <Image
            src={film.posterUrl}
            alt={film.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover motion-safe:group-hover:scale-105 transition-transform duration-500"
            priority={priority}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #0891B2 0%, #1E40AF 50%, #7C3AED 100%)",
            }}
          />
        )}
        {/* Bottom gradient for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/0 pointer-events-none" />

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-85 motion-safe:group-hover:opacity-100 transition-opacity">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
            style={{ background: "rgba(255,255,255,0.96)" }}
          >
            <Play
              className="w-5 h-5 ml-0.5 fill-current"
              style={{ color: accent }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Episode badge */}
        {showEpisodeBadge && label && (
          <div
            className="absolute top-3 left-3 px-2 py-1 rounded-full text-[0.625rem] font-bold tracking-[0.18em] uppercase backdrop-blur-md"
            style={{
              background: "rgba(15,23,42,0.72)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {label}
          </div>
        )}

        {/* NEW badge */}
        <NewBadge show={showNew} className="absolute top-3 right-3" />
      </div>

      {/* Body */}
      <div className="p-4 md:p-5">
        {film.headline && film.headline !== film.title && (
          <div
            className="text-[0.625rem] font-bold tracking-[0.2em] uppercase mb-2 line-clamp-1"
            style={{ color: accent }}
          >
            {film.headline}
          </div>
        )}
        <h3 className="text-base font-bold text-[var(--c-text)] leading-snug mb-2 line-clamp-2">
          {film.title}
        </h3>
        {film.tagline && (
          <p className="text-sm text-[var(--c-text-muted)] leading-relaxed line-clamp-2">
            {film.tagline}
          </p>
        )}
      </div>
    </Link>
  );
}

/** Skeleton placeholder used while data is loading (ISR cache miss).
 *  Mirrors FilmCard's 16:9 + body shape so the layout doesn't jump
 *  when content arrives. */
export function FilmCardSkeleton() {
  return (
    <div className="block rounded-[var(--r-xl)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)]">
      <div
        className="w-full bg-[var(--c-bg)] motion-safe:animate-pulse"
        style={{ aspectRatio: "16 / 9" }}
      />
      <div className="p-4 md:p-5 space-y-2">
        <div className="h-2.5 w-1/3 rounded-full bg-[var(--c-bg)] motion-safe:animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-[var(--c-bg)] motion-safe:animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-[var(--c-bg)] motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
