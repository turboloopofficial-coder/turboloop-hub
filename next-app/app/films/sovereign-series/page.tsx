// /films/sovereign-series — the Season 2 "Sovereign Series" catalogue.
//
// Lives separately from /films (which renders the original 20-film
// Cinematic Universe from the bundled FILMS array) so the new
// DB-driven, multilingual catalogue can evolve without entangling
// with the static cinematic-universe code path.
//
// Language is read from the ?lang= query param. Defaults to 'en'.
// The four language tabs are server-rendered <Link>s — clicking
// switches the route, the page re-renders server-side with the
// requested language. No client JS for tab state.
//
// Film data is fetched via the /api/s2-films edge route (built atop
// direct Neon HTTP) with 60-second ISR caching matching the API's
// own cache header.

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";

export const revalidate = 300; // 5 min

type LangCode = "en" | "de" | "hi" | "id";
const LANG_TABS: ReadonlyArray<{ code: LangCode; label: string; flag: string }> = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "id", label: "Bahasa", flag: "🇮🇩" },
];

interface S2Film {
  canonicalSlug: string;
  title: string;
  headline: string;
  tagline: string;
  description: string;
  directUrl: string;
  posterUrl: string | null;
  videoNum: number;
}

const TITLE = "Sovereign Series — Season 2";
const DESC =
  "20 films across 4 blocks: The Proof is Live · The Mindset Shift · The Execution · The Vision. Available in English, German, Hindi, and Bahasa Indonesia.";
const OG_IMAGE =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-films.png";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: {
    canonical: "https://www.turboloop.tech/films/sovereign-series",
    languages: {
      en: "https://www.turboloop.tech/films/sovereign-series?lang=en",
      de: "https://www.turboloop.tech/films/sovereign-series?lang=de",
      hi: "https://www.turboloop.tech/films/sovereign-series?lang=hi",
      id: "https://www.turboloop.tech/films/sovereign-series?lang=id",
      "x-default": "https://www.turboloop.tech/films/sovereign-series",
    },
  },
  openGraph: {
    title: TITLE,
    description: DESC,
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

// Block titles map to V01-V05, V06-V10, V11-V15, V16-V20.
const BLOCKS: ReadonlyArray<{ title: string; range: [number, number]; emoji: string }> = [
  { title: "The Proof is Live", range: [1, 5], emoji: "📊" },
  { title: "The Mindset Shift", range: [6, 10], emoji: "🧠" },
  { title: "The Execution", range: [11, 15], emoji: "⚙️" },
  { title: "The Vision", range: [16, 20], emoji: "🌍" },
];

function isLang(v: string | undefined): v is LangCode {
  return v === "en" || v === "de" || v === "hi" || v === "id";
}

async function fetchFilms(lang: LangCode): Promise<S2Film[]> {
  // Server-side fetch against the same-origin edge route. Uses Next.js
  // built-in fetch caching (revalidate matches the page's own).
  const res = await fetch(
    `https://www.turboloop.tech/api/s2-films?lang=${lang}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { films?: S2Film[] };
  return data.films ?? [];
}

export default async function SovereignSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const activeLang: LangCode = isLang(lang) ? lang : "en";
  const films = await fetchFilms(activeLang);

  // Group by block (V01-V05, V06-V10, ...) for visual sectioning.
  const filmsByBlock = BLOCKS.map(b => ({
    ...b,
    films: films.filter(f => f.videoNum >= b.range[0] && f.videoNum <= b.range[1]),
  }));

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
              Sovereign Series · Season 2
            </Heading>
            <Heading tier="display" className="mb-4">
              <span>20 films.</span>
              <br />
              <span className="text-brand-wide">4 languages.</span>
            </Heading>
            <p className="text-lg text-[var(--c-text-muted)] leading-relaxed">
              The mindset shift, the execution, the vision — every film in your
              language. Free to watch, free to share.
            </p>
            <div className="mt-5 text-sm text-[var(--c-text-muted)]">
              {films.length} films in {LANG_TABS.find(l => l.code === activeLang)?.label}
            </div>
          </div>
        </Container>
      </section>

      {/* Language tabs */}
      <Container width="default">
        <nav
          aria-label="Choose language"
          className="flex flex-wrap gap-2 mb-10 justify-center"
        >
          {LANG_TABS.map(tab => {
            const isActive = tab.code === activeLang;
            const href =
              tab.code === "en"
                ? "/films/sovereign-series"
                : `/films/sovereign-series?lang=${tab.code}`;
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

      {/* Films grid, sectioned by block */}
      <Container width="wide">
        {films.length === 0 ? (
          <div
            className="rounded-[var(--r-xl)] p-10 text-center text-[var(--c-text-muted)] border border-[var(--c-border)] bg-[var(--c-surface)]"
          >
            <p className="mb-2 text-lg font-bold text-[var(--c-text)]">
              No films available in this language yet.
            </p>
            <p>
              Try{" "}
              <Link
                href="/films/sovereign-series"
                className="text-[var(--c-brand-cyan)] font-bold hover:underline"
              >
                English
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-12 md:space-y-16">
            {filmsByBlock.map((block, idx) => {
              if (block.films.length === 0) return null;
              return (
                <section key={block.title}>
                  <div className="mb-5 md:mb-7">
                    <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-brand-cyan)] mb-1.5">
                      Block {idx + 1}
                    </div>
                    <Heading tier="h2" as="h2">
                      <span className="mr-2" aria-hidden="true">
                        {block.emoji}
                      </span>
                      {block.title}
                    </Heading>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {block.films.map(film => (
                      <FilmCard key={film.canonicalSlug} film={film} lang={activeLang} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </Container>
    </main>
  );
}

function FilmCard({ film, lang }: { film: S2Film; lang: LangCode }) {
  const detailHref =
    lang === "en"
      ? `/films/sovereign-series/${film.canonicalSlug}`
      : `/films/sovereign-series/${film.canonicalSlug}?lang=${lang}`;
  return (
    <Link
      href={detailHref}
      className="group relative block rounded-[var(--r-xl)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-md)] hover:shadow-[var(--s-xl)] hover:-translate-y-1 transition-[transform,box-shadow] duration-[var(--m-smooth)] ease-[var(--m-standard)] active:scale-[0.99]"
    >
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
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            unoptimized
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.5)] opacity-90 group-hover:opacity-100 transition"
            style={{ background: "rgba(255,255,255,0.95)" }}
          >
            <Play className="w-5 h-5 ml-0.5 fill-current text-[var(--c-brand-cyan)]" />
          </div>
        </div>
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[0.625rem] font-bold tracking-[0.18em] uppercase bg-black/60 text-white">
          V{String(film.videoNum).padStart(2, "0")}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-base font-bold text-[var(--c-text)] leading-snug mb-1 line-clamp-2">
          {film.title}
        </h3>
        {film.headline && film.headline !== film.title && (
          <p className="text-xs text-[var(--c-text-muted)] line-clamp-2 leading-snug">
            {film.headline}
          </p>
        )}
      </div>
    </Link>
  );
}
