// ReelCard — premium card for the homepage reels carousel.
//
// Vertical 9:16 thumbnail (matches short-form video format) with all
// the actions visible on the card itself:
//   - Title + tagline below the thumbnail
//   - Share button (compact icon, opens Web Share / clipboard)
//   - Download button (compact icon, /api/download proxy)
//   - NEW badge in the top-right if shouldShowNewBadge() returns true
//   - Tap navigates to /reels/[slug] — playback lives there, not inline
//
// Why no inline playback: even on a 2-5MB short, 4G connections in
// Lagos/Manila/Jakarta take 2-4 seconds to buffer. That's not premium.
// Tap-to-navigate gives the player a full screen + dedicated bandwidth
// budget. Native streaming UX, same as Instagram Reels / TikTok.
//
// Forced dark style on the card surface — the carousel sits inside a
// dark-bg homepage section, so a dark card with subtle brand glow on
// hover is the consistent design language.

"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Share2, Download, Check } from "lucide-react";
import { NewBadge } from "@components/ui/NewBadge";
import { shouldShowNewBadge, type DbReel } from "@lib/reelsApi";
import { downloadFile } from "@lib/downloadFile";

interface ReelCardProps {
  reel: DbReel;
}

export function ReelCard({ reel }: ReelCardProps) {
  const [copied, setCopied] = useState(false);
  const detailUrl = `https://www.turboloop.tech/reels/${reel.slug}`;
  const showNew = shouldShowNewBadge(reel);
  // handleDownload only fires for R2-hosted reels (where we have a
  // direct mp4 URL). YouTube-only reels skip the download path —
  // their "share" still works via the Share button below.
  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    if (!reel.directUrl) return;
    // fetch → blob → same-origin object URL (works on Android Chrome)
    // Falls back to proxy if CORS fails, then opens in new tab.
    downloadFile(reel.directUrl, `${reel.slug}.mp4`);
  }

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const text = reel.tagline
      ? `${reel.title}\n\n${reel.tagline}\n\nturboloop.tech`
      : `${reel.title}\n\nturboloop.tech`;
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({ title: reel.title, text, url: detailUrl });
        return;
      } catch {
        // fall through
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(detailUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      } catch {
        /* noop */
      }
    }
  }

  return (
    <div
      className="tl-film-card group relative shrink-0 snap-start rounded-[var(--r-xl)] overflow-hidden block bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-md)] flex flex-col"
      style={{ width: "min(260px, 75vw)" }}
    >
      <Link
        href={`/reels/${reel.slug}`}
        className="block relative outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-brand-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--c-bg)]"
        aria-label={`Watch ${reel.title}`}
      >
        {/* 9:16 portrait thumbnail */}
        <div
          className="relative w-full bg-[var(--c-bg)]"
          style={{ aspectRatio: "9 / 16" }}
        >
          {reel.thumbUrl ? (
            <Image
              src={reel.thumbUrl}
              alt={reel.title}
              fill
              sizes="260px"
              className="object-cover motion-safe:group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
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
          {/* Bottom + top gradient for legibility */}
          <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.55)] opacity-90 motion-safe:group-hover:opacity-100 motion-safe:group-hover:scale-110 transition"
              style={{ background: "rgba(255,255,255,0.96)" }}
            >
              <Play className="w-5 h-5 ml-0.5 fill-current text-[var(--c-brand-cyan)]" aria-hidden="true" />
            </div>
          </div>

          {/* Reel badge */}
          <div
            className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[0.625rem] font-bold tracking-[0.18em] uppercase backdrop-blur-md"
            style={{
              background: "rgba(15,23,42,0.7)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            ▸ Reel
          </div>

          {/* NEW badge */}
          <NewBadge show={showNew} className="absolute top-2.5 right-2.5" />

          {/* Title overlay on the thumbnail */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <h4 className="text-sm font-bold leading-snug line-clamp-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              {reel.title}
            </h4>
          </div>
        </div>
      </Link>

      {/* Body — tagline + action row */}
      <div className="p-3 flex flex-col gap-3">
        {reel.tagline && (
          <p className="text-xs text-[var(--c-text-muted)] leading-relaxed line-clamp-2">
            {reel.tagline}
          </p>
        )}
        <div className="flex items-center gap-2 mt-auto">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-1.5 flex-1 h-9 rounded-full text-xs font-bold bg-brand text-white shadow-[var(--s-brand)] active:scale-[0.985] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-brand-cyan)]"
            aria-label={`Share ${reel.title}`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                Share
              </>
            )}
          </button>
          {reel.directUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-1.5 flex-1 h-9 rounded-full text-xs font-bold bg-[var(--c-bg)] text-[var(--c-text)] border border-[var(--c-border)] hover:border-[var(--c-brand-cyan)] active:scale-[0.985] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-brand-cyan)]"
              aria-label={`Download ${reel.title}`}
            >
              <Download className="w-3.5 h-3.5" />
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
