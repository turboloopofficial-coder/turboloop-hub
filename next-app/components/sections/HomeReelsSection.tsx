// HomeReelsSection — premium homepage reels carousel.
//
// COMPLETE REDESIGN as part of Turn 6 of the content restructure.
//
// Changes vs the previous version:
//   • Sort key: COALESCE(pinned_at, created_at) DESC — newest reels
//     surface first. Previously sort_order ASC buried the newer S2
//     uploads behind the older S1 set.
//   • Each card now shows Share + Download + Tagline directly on the
//     card. Previously the card was just a thumbnail.
//   • NEW badge on cards uploaded < 30 days ago or with
//     pinned_new_until set in the future.
//   • Forced dark background on the section so the cards' brand glow
//     reads correctly (Netflix-style media-section exception).
//   • Mobile: full-width swipeable cards with scroll-snap-x mandatory.
//   • Section header upgraded to editorial-style with gradient accent.

import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { ReelCard } from "@components/reels/ReelCard";
import { fetchAllReels } from "@lib/reelsApi";

export async function HomeReelsSection() {
  const reels = await fetchAllReels();
  if (reels.length === 0) return null;

  const visibleReels = reels.slice(0, 12);

  return (
    <section className="dark py-12 md:py-20 relative overflow-hidden bg-[var(--c-bg)] text-[var(--c-text)]">
      {/* Ambient background — subtle radial gradient for premium feel */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(8,145,178,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(124,58,237,0.12) 0%, transparent 50%)",
        }}
      />

      <Container width="wide" className="relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 md:mb-8 gap-4">
          <div>
            <div
              className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border"
              style={{
                background: "rgba(34,211,238,0.08)",
                borderColor: "rgba(34,211,238,0.25)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--c-brand-cyan)]" />
              <span className="text-[0.625rem] font-bold tracking-[0.22em] uppercase text-[var(--c-brand-cyan)]">
                Latest Reels
              </span>
            </div>
            <Heading tier="h1">
              Watch the{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #06B6D4 0%, #7C3AED 50%, #DB2777 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Movement.
              </span>
            </Heading>
            <p className="text-[var(--c-text-muted)] mt-3 max-w-xl text-base md:text-lg leading-relaxed">
              Short explainers, fresh perspectives, and proof from the field.
              New reels added every week — share, save, repeat.
            </p>
          </div>
          <Link
            href="/library"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold text-[var(--c-brand-cyan)] hover:underline"
          >
            See all reels →
          </Link>
        </div>
      </Container>

      <div
        className="overflow-x-auto pb-4 px-[var(--gutter)] scrollbar-hide"
        style={{
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: "var(--gutter)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex gap-3 md:gap-4">
          {visibleReels.map(reel => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
          {reels.length > visibleReels.length && (
            <Link
              href="/library"
              className="shrink-0 snap-start rounded-[var(--r-xl)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-md)] hover:border-[var(--c-brand-cyan)] active:scale-[0.985] transition flex flex-col items-center justify-center text-center p-6"
              style={{ width: "min(260px, 75vw)" }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                style={{
                  background:
                    "linear-gradient(135deg, #06B6D4 0%, #7C3AED 100%)",
                }}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-bold text-[var(--c-text)] mb-1">
                {reels.length - visibleReels.length}+ more reels
              </div>
              <div className="text-xs text-[var(--c-text-muted)]">
                Browse the full library →
              </div>
            </Link>
          )}
        </div>
      </div>

      <Container width="wide" className="md:hidden mt-3">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--c-brand-cyan)]"
        >
          See all reels
          <ChevronRight className="w-4 h-4" />
        </Link>
      </Container>
    </section>
  );
}
