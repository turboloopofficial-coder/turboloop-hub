// /films — the unified films catalogue.
//
// All films (S2 Sovereign Series + original Cinematic Universe) are now
// rendered from the videos table on a single page, sorted newest-first
// by COALESCE(pinned_at, created_at). Language tabs (EN/DE/HI/ID)
// filter the query.
//
// Two visual sections within the page:
//   1. Sovereign Series — Season 2 (top, newest content): 20 films
//      ordered V01..V20 within their 4 Blocks (The Proof is Live, The
//      Mindset Shift, The Execution, The Vision).
//   2. Cinematic Universe (below): the original 20 EN films grouped by
//      their existing 4 seasons (The Problem → The Movement).
//
// The page is forced into dark mode regardless of the user's selected
// theme — this is a stylistic exception for media pages (like Netflix
// or Apple TV+). The rest of the site continues to respect the user's
// theme.
//
// Detail clicks route to /films/[slug]?lang=<lang> — the single
// unified detail page (turn 4 of the restructure). The old static
// FILMS array in lib/cinematicUniverse.ts is no longer used for
// rendering — kept in the repo only as rollback safety until the
// migration has been in production for ~1 week.

import type { Metadata } from "next";
import Link from "next/link";
import {
  fetchFilmsByLanguage,
  groupFilmsForListing,
  type FilmLang,
} from "@lib/filmsApi";
import { SEASONS } from "@lib/cinematicUniverse";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { FilmCard, FilmCardSkeleton } from "@components/films/FilmCard";

export const revalidate = 300; // 5 min ISR

const TITLE = "Cinematic Universe — TurboLoop";
const DESC =
  "All TurboLoop films in one place — Sovereign Series S2 + the original 4-season Cinematic Universe. English, German, Hindi, Bahasa Indonesia. Free to watch.";
const OG_IMAGE =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-films.png";

const LANG_TABS: ReadonlyArray<{ code: FilmLang; label: string; flag: string }> = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "id", label: "Bahasa", flag: "🇮🇩" },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: {
    canonical: "https://www.turboloop.tech/films",
    languages: {
      en: "https://www.turboloop.tech/films?lang=en",
      de: "https://www.turboloop.tech/films?lang=de",
      hi: "https://www.turboloop.tech/films?lang=hi",
      id: "https://www.turboloop.tech/films?lang=id",
      "x-default": "https://www.turboloop.tech/films",
    },
  },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: "https://www.turboloop.tech/films",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: [OG_IMAGE],
  },
};

const S2_BLOCKS: ReadonlyArray<{
  range: [number, number];
  title: string;
  emoji: string;
  accent: string;
}> = [
  { range: [1, 5], title: "The Proof is Live", emoji: "📊", accent: "#0891B2" },
  { range: [6, 10], title: "The Mindset Shift", emoji: "🧠", accent: "#7C3AED" },
  { range: [11, 15], title: "The Execution", emoji: "⚙️", accent: "#F59E0B" },
  { range: [16, 20], title: "The Vision", emoji: "🌍", accent: "#10B981" },
];

function isLang(v: string | undefined): v is FilmLang {
  return v === "en" || v === "de" || v === "hi" || v === "id";
}

export default async function FilmsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const activeLang: FilmLang = isLang(lang) ? lang : "en";

  const films = await fetchFilmsByLanguage(activeLang);
  const { sovereignSeries, cinematicUniverse } = groupFilmsForListing(films);

  const totalCount = sovereignSeries.length + Object.values(cinematicUniverse).flat().length;
  const hasContent = totalCount > 0;

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
              Cinematic Universe
            </Heading>
            <Heading tier="display" className="mb-4">
              <span>The full story.</span>
              <br />
              <span className="text-brand-wide">In four languages.</span>
            </Heading>
            <p className="text-lg text-[var(--c-text-muted)] leading-relaxed">
              The Sovereign Series Season 2 + the original 4-season Cinematic
              Universe. Free to watch. Free to share. Free to download.
            </p>
            {hasContent && (
              <div className="mt-5 text-sm text-[var(--c-text-muted)]">
                {totalCount} films in{" "}
                <span className="text-[var(--c-text)] font-bold">
                  {LANG_TABS.find(l => l.code === activeLang)?.label}
                </span>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Language tabs */}
      <Container width="default">
        <nav
          aria-label="Choose language"
          className="flex flex-wrap gap-2 mb-10 md:mb-14 justify-center"
        >
          {LANG_TABS.map(tab => {
            const isActive = tab.code === activeLang;
            const href = tab.code === "en" ? "/films" : `/films?lang=${tab.code}`;
            return (
              <Link
                key={tab.code}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex items-center gap-2 px-4 h-10 rounded-full text-sm font-bold transition active:scale-[0.985] ${
                  isActive
                    ? "bg-brand text-white shadow-[var(--s-brand)]"
                    : "bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] hover:border-[var(--c-brand-cyan)]"
                }`}
              >
                <span className="text-base leading-none" aria-hidden="true">
                  {tab.flag}
                </span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </Container>

      {!hasContent && (
        <Container width="default">
          <div
            className="rounded-[var(--r-xl)] p-10 text-center text-[var(--c-text-muted)] border border-[var(--c-border)] bg-[var(--c-surface)] max-w-2xl mx-auto"
          >
            <p className="mb-2 text-lg font-bold text-[var(--c-text)]">
              No films published in this language yet.
            </p>
            <p>
              Try{" "}
              <Link
                href="/films"
                className="text-[var(--c-brand-cyan)] font-bold hover:underline"
              >
                English
              </Link>
              .
            </p>
          </div>
        </Container>
      )}

      {/* SOVEREIGN SERIES — SEASON 2 (top: newest content) */}
      {sovereignSeries.length > 0 && (
        <Container width="wide">
          <section className="mb-16 md:mb-20">
            <div className="mb-6 md:mb-10 text-center md:text-left">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-3"
                style={{
                  background: "rgba(8,145,178,0.15)",
                  color: "#22D3EE",
                  border: "1px solid rgba(34,211,238,0.30)",
                }}
              >
                <span>⚡</span>
                <span>Sovereign Series — Season 2</span>
              </div>
              <Heading tier="h2" className="mb-3">
                20 new films. 4 blocks. The mindset shift.
              </Heading>
              <p className="text-[var(--c-text-muted)] max-w-2xl">
                The Sovereign Series picks up where the Cinematic Universe
                ended — from proof to mindset to execution to vision.
              </p>
            </div>

            {/* Films grouped by block */}
            <div className="space-y-10 md:space-y-14">
              {S2_BLOCKS.map((block, idx) => {
                const blockFilms = sovereignSeries.filter(
                  f => f.sortOrder >= block.range[0] && f.sortOrder <= block.range[1]
                );
                if (blockFilms.length === 0) return null;
                return (
                  <div key={block.title}>
                    <div className="mb-4 md:mb-6 flex items-baseline gap-3 flex-wrap">
                      <span
                        className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase"
                        style={{ color: block.accent }}
                      >
                        Block {idx + 1}
                      </span>
                      <h3 className="text-lg md:text-xl font-bold text-[var(--c-text)] leading-tight">
                        <span className="mr-2" aria-hidden="true">{block.emoji}</span>
                        {block.title}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                      {blockFilms.map(film => (
                        <FilmCard
                          key={film.id}
                          film={film}
                          activeLang={activeLang}
                          accent={block.accent}
                          showEpisodeBadge
                          episodeLabel={`V${String(film.sortOrder).padStart(2, "0")}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </Container>
      )}

      {/* ORIGINAL CINEMATIC UNIVERSE — grouped by season 1-4 */}
      {([1, 2, 3, 4] as const).map(s => {
        const seasonFilms = cinematicUniverse[s];
        if (!seasonFilms || seasonFilms.length === 0) return null;
        const info = SEASONS[s];
        return (
          <section
            key={s}
            className="py-10 md:py-14 border-t border-[var(--c-border)]"
          >
            <Container width="wide">
              <div className="mb-8 md:mb-10 text-center md:text-left">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-3"
                  style={{
                    background: `${info.accent}15`,
                    color: info.accent,
                    border: `1px solid ${info.accent}30`,
                  }}
                >
                  <span>{info.emoji}</span>
                  <span>{info.name}</span>
                </div>
                <Heading tier="h2" className="mb-3">
                  {info.name.replace(/^Season \d+ — /, "")}
                </Heading>
                <p className="text-[var(--c-text-muted)] max-w-2xl">
                  {info.theme}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {seasonFilms.map(film => (
                  <FilmCard
                    key={film.id}
                    film={film}
                    activeLang={activeLang}
                    accent={info.accent}
                    showEpisodeBadge
                    episodeLabel={`S${film.season}·E${film.episode}`}
                  />
                ))}
              </div>
            </Container>
          </section>
        );
      })}
    </main>
  );
}
