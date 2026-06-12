// /reels — the unified reels listing page. Sister page to /films, but
// for the shorter / vertical / tutorial-style videos that live in the
// `presentation`, `how-to-join`, and `withdraw-compound` categories.
//
// Previously this URL 404'd — only /reels/[slug] detail pages existed.
// The audit on 2026-05-22 surfaced it; this page closes the gap and
// lets every newly-slugged reel (including the how-to-join + withdraw-
// compound multi-lang sets) become discoverable from one entry point.
//
// Reels can be backed by EITHER an R2-hosted mp4 or a YouTube video.
// The card thumbnail is computed once in reelsApi.ts (R2 path
// translation OR YouTube hqdefault.jpg fallback) so the listing doesn't
// need to know the source.

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { NewBadge } from "@components/ui/NewBadge";
import { fetchAllReels, shouldShowNewBadge } from "@lib/reelsApi";

export const revalidate = 300;

const TITLE = "Reels — TurboLoop";
const DESC =
  "Every TurboLoop reel in one place. Short-form videos, how-to-join walkthroughs in 10 languages, withdraw + compound + referral tutorials. Free to watch, ready to share.";
const OG_IMAGE =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-films.png";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "https://www.turboloop.tech/reels" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESC,
    url: "https://www.turboloop.tech/reels",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: [OG_IMAGE],
  },
};

// Friendly labels for each category section. Order in this array
// determines visual order on the page — presentation first because
// those are the "premium" English reels (Sovereign Series shorts);
// how-to-join + withdraw-compound are the tutorial banks.
const CATEGORY_SECTIONS: Array<{
  category: string;
  label: string;
  description: string;
  emoji: string;
}> = [
  {
    category: "presentation",
    label: "Featured reels",
    description: "Sovereign Series shorts + multi-language project intros.",
    emoji: "🎬",
  },
  {
    category: "how-to-join",
    label: "How to join — by language",
    description:
      "Step-by-step walkthroughs in 10 languages: install wallet → buy USDT → pick a Loop Plan.",
    emoji: "🚀",
  },
  {
    category: "withdraw-compound",
    label: "Withdraw, compound & refer",
    description:
      "How to claim daily earnings, re-deposit to compound, and use the referral system. 8 languages.",
    emoji: "💰",
  },
];

export default async function ReelsPage() {
  const reels = await fetchAllReels();
  const total = reels.length;

  // Group reels by category for sectioned rendering. Anything in an
  // unrecognized category falls into a generic "More" bucket at the
  // bottom — defensive against future category additions.
  const byCategory = new Map<string, typeof reels>();
  for (const r of reels) {
    const arr = byCategory.get(r.category) ?? [];
    arr.push(r);
    byCategory.set(r.category, arr);
  }
  const knownCategories = new Set(CATEGORY_SECTIONS.map(s => s.category));
  const otherCategories: string[] = [];
  for (const [cat] of byCategory) {
    if (!knownCategories.has(cat)) otherCategories.push(cat);
  }

  return (
    <main className="dark relative pb-12 md:pb-20 bg-[var(--c-bg)] text-[var(--c-text)]">
      {/* Hero */}
      <section className="relative pt-12 pb-8 md:pt-20 md:pb-12">
        <Container width="default">
          <div className="text-center max-w-2xl mx-auto">
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-3 inline-block"
            >
              Short-form, every language
            </Heading>
            <Heading tier="display" className="mb-4">
              <span>Reels.</span>{" "}
              <span className="text-brand-wide">Tutorials.</span>
            </Heading>
            <p className="text-lg text-[var(--c-text-muted)] leading-relaxed">
              Every TurboLoop reel in one place — featured shorts, how-to-join
              walkthroughs in 10 languages, plus withdraw, compound, and
              referral tutorials. Free to watch, ready to share.
            </p>
            {total > 0 && (
              <div className="mt-5 text-sm text-[var(--c-text-muted)]">
                {total} reels available
              </div>
            )}
          </div>
        </Container>
      </section>

      {total === 0 && (
        <Container width="default">
          <div className="rounded-[var(--r-xl)] p-10 text-center text-[var(--c-text-muted)] border border-[var(--c-border)] bg-[var(--c-surface)] max-w-2xl mx-auto">
            <p className="mb-2 text-lg font-bold text-[var(--c-text)]">
              No reels published yet.
            </p>
            <p>
              Check{" "}
              <Link
                href="/films"
                className="text-[var(--c-brand-cyan)] font-bold hover:underline"
              >
                Films
              </Link>{" "}
              for full-length content.
            </p>
          </div>
        </Container>
      )}

      {/* Sections — render in the canonical CATEGORY_SECTIONS order,
          then append any unknown categories at the bottom. */}
      <Container width="wide">
        {CATEGORY_SECTIONS.map(section => {
          const items = byCategory.get(section.category) ?? [];
          if (items.length === 0) return null;
          return (
            <section
              key={section.category}
              className="mb-14 md:mb-20 scroll-mt-20"
              id={section.category}
            >
              <div className="mb-6 md:mb-8 text-center md:text-left">
                <Heading
                  tier="eyebrow"
                  className="text-[var(--c-brand-cyan)] mb-2 inline-block"
                >
                  <span className="mr-1" aria-hidden="true">
                    {section.emoji}
                  </span>
                  {section.label} · {items.length}
                </Heading>
                <p className="text-[var(--c-text-muted)] max-w-2xl">
                  {section.description}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {items.map(reel => (
                  <ReelTile key={reel.id} reel={reel} />
                ))}
              </div>
            </section>
          );
        })}

        {otherCategories.map(cat => {
          const items = byCategory.get(cat) ?? [];
          if (items.length === 0) return null;
          return (
            <section key={cat} className="mb-14 md:mb-20" id={cat}>
              <Heading
                tier="eyebrow"
                className="text-[var(--c-brand-cyan)] mb-4 inline-block"
              >
                {cat} · {items.length}
              </Heading>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {items.map(reel => (
                  <ReelTile key={reel.id} reel={reel} />
                ))}
              </div>
            </section>
          );
        })}
      </Container>
    </main>
  );
}

/** Single reel tile — 9:16 thumbnail + title + language flag + NEW
 *  badge when within 30 days of upload. Server component, no JS. */
function ReelTile({
  reel,
}: {
  reel: Awaited<ReturnType<typeof fetchAllReels>>[number];
}) {
  const showNew = shouldShowNewBadge(reel);
  return (
    <Link
      href={`/reels/${reel.slug}`}
      className="group relative block rounded-[var(--r-lg)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-lg)] hover:-translate-y-0.5 transition active:scale-[0.99]"
    >
      <div
        className="relative w-full bg-black"
        style={{ aspectRatio: "9 / 16" }}
      >
        {reel.thumbUrl ? (
          <Image
            src={reel.thumbUrl}
            alt={reel.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs">
            no thumbnail
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        {/* Source badge — tiny indicator of R2 vs YouTube backing. Helps
            QA distinguish at a glance which path each card uses. */}
        <span
          className="absolute top-2 left-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase text-white/90 bg-black/40 backdrop-blur"
          aria-hidden="true"
        >
          {reel.directUrl ? "Reel" : "▶ YouTube"}
        </span>
        <NewBadge show={showNew} size="sm" className="absolute top-2 right-2" />
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-base leading-none" aria-hidden="true">
            {reel.languageFlag}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)] font-bold">
            {reel.language}
          </span>
        </div>
        <h3 className="text-sm font-bold text-[var(--c-text)] line-clamp-2 leading-snug">
          {reel.title}
        </h3>
      </div>
    </Link>
  );
}
