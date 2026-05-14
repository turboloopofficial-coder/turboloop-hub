// /films — the cinematic universe index. 20 films across 4 seasons.
//
// All static. The film data is bundled in lib/cinematicUniverse.ts; no
// network call. Renders as plain HTML — Next.js prerenders the whole
// page at build time. On the Realme Narzo 50 this means ~300 ms first
// paint instead of ~1.5 s for the SPA equivalent.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import {
  FILMS,
  SEASONS,
  type Season,
  getFilmsBySeason,
} from "@lib/cinematicUniverse";
import {
  MULTI_LANG_REELS,
  REEL_LANGUAGES,
  type ReelTrack,
} from "@lib/reelsData";

const FILMS_OG_TITLE = "Cinematic Universe — TurboLoop";
const FILMS_OG_DESC = "20 films. 4 seasons. One story.";
const FILMS_OG_IMAGE = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-films.png";

export const metadata: Metadata = {
  title: "Cinematic Universe — 20 Films Across 4 Seasons",
  description:
    "From The Problem to The Movement — the full TurboLoop story told in 20 films. Watch each season free.",
  alternates: { canonical: "https://turboloop.tech/films" },
  openGraph: {
    title: FILMS_OG_TITLE,
    description: FILMS_OG_DESC,
    url: "https://turboloop.tech/films",
    type: "website",
    images: [
      { url: FILMS_OG_IMAGE, width: 1200, height: 630, alt: FILMS_OG_TITLE },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: FILMS_OG_TITLE,
    description: FILMS_OG_DESC,
    images: [FILMS_OG_IMAGE],
  },
};

export default function FilmsIndexPage() {
  const seasons: Season[] = [1, 2, 3, 4];
  return (
    <main className="relative pb-12 md:pb-20">
      {/* Header */}
      <section className="relative pt-12 pb-10 md:pt-20 md:pb-14">
        <Container width="default">
          <div className="text-center max-w-2xl mx-auto">
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-3 inline-block"
            >
              Cinematic Universe
            </Heading>
            <Heading tier="display" className="mb-5">
              <span className="text-brand-wide">20 films.</span>
              <br />
              <span>4 seasons. One story.</span>
            </Heading>
            <p className="text-lg text-[var(--c-text-muted)] leading-relaxed">
              From <em>The Problem</em> to <em>The Movement</em> — every film
              is a chapter in why the financial system was never built for
              you, and what you can do about it now.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--c-text-muted)]">
              <span>{FILMS.length} films · ~60 minutes total · free</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Seasons */}
      {seasons.map(s => {
        const info = SEASONS[s];
        const films = getFilmsBySeason(s);
        return (
          <section
            key={s}
            className="py-10 md:py-14 border-t border-[var(--c-border)]"
          >
            <Container width="wide">
              {/* Season header */}
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
                <Heading tier="h1" className="mb-3">
                  {info.name.replace(/^Season \d+ — /, "")}
                </Heading>
                <p className="text-[var(--c-text-muted)] max-w-2xl">
                  {info.theme}
                </p>
              </div>

              {/* Films grid — 1 col mobile, 2 col md, 3 col lg */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {films.map(film => (
                  <Link
                    key={film.slug}
                    href={`/films/${film.slug}`}
                    className="group block rounded-[var(--r-xl)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-md)] hover:shadow-[var(--s-lg)] hover:-translate-y-0.5 transition-[transform,box-shadow] active:scale-[0.99]"
                  >
                    {/* Poster */}
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: "16 / 9" }}
                    >
                      <Image
                        src={film.posterUrl}
                        alt={`${film.title} — film poster`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                          style={{
                            background: "rgba(255,255,255,0.95)",
                          }}
                        >
                          <Play
                            className="w-5 h-5 ml-0.5 fill-current"
                            style={{ color: info.accent }}
                          />
                        </div>
                      </div>
                      {/* Episode badge */}
                      <div
                        className="absolute top-3 left-3 px-2 py-1 rounded-full text-[0.6875rem] font-bold tracking-[0.15em] uppercase backdrop-blur-md"
                        style={{
                          background: "rgba(15,23,42,0.7)",
                          color: "white",
                        }}
                      >
                        S{film.season} · E{film.episode}
                      </div>
                    </div>
                    {/* Body */}
                    <div className="p-5">
                      <div
                        className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-2"
                        style={{ color: info.accent }}
                      >
                        {film.headline}
                      </div>
                      <h3 className="text-base font-bold text-[var(--c-text)] leading-snug mb-2">
                        {film.title}
                      </h3>
                      <p className="text-sm text-[var(--c-text-muted)] leading-relaxed line-clamp-2">
                        {film.tagline}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        );
      })}

      {/* ─── Shorts / Reels — multi-language tutorials ──────────────
          Three logical reels × three languages = 9 vertical clips.
          Layout: one row per language so visitors can scan by lang
          and tap the one in theirs. Mobile keeps everything
          single-column; desktop goes 3-up per language band. */}
      <section className="relative pt-6 pb-12 md:pb-20 border-t border-[var(--c-border)] mt-10 md:mt-14">
        <Container width="default">
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-3 inline-block"
            >
              Shorts & Reels
            </Heading>
            <Heading tier="h2" as="h2" className="mb-3">
              Tutorials, in your language.
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed">
              Quick, mobile-first walkthroughs of the things people
              actually ask — withdrawals, investments, and verifying the
              LP lock yourself. Available in English, Deutsch, and
              Bahasa Indonesia.
            </p>
          </div>

          {REEL_LANGUAGES.map(lang => {
            const reels = MULTI_LANG_REELS[lang.code];
            return (
              <div key={lang.code} className="mb-10 md:mb-14 last:mb-0">
                <div className="flex items-center gap-3 mb-4 md:mb-5">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.6875rem] font-bold tracking-[0.2em] uppercase"
                    style={{
                      color: "var(--c-brand-cyan)",
                      background:
                        "color-mix(in oklab, var(--c-brand-cyan) 10%, transparent)",
                      border: "1px solid var(--c-border)",
                    }}
                  >
                    <span aria-hidden="true">{lang.flag}</span>
                    {lang.code.toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-[var(--c-text-muted)]">
                    {lang.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {reels.map(reel => (
                    <ReelCard key={`${lang.code}-${reel.id}`} reel={reel} />
                  ))}
                </div>
              </div>
            );
          })}
        </Container>
      </section>
    </main>
  );
}

/* ── ReelCard — vertical-format card with thumbnail + click-to-play
      <video>. Native controls keep the bundle lean; preload="none"
      ensures we don't fetch megabytes of MP4 the user never plays. */

function ReelCard({ reel }: { reel: ReelTrack }) {
  return (
    <Card
      elevation="raised"
      padding="none"
      interactive
      className="h-full overflow-hidden flex flex-col"
    >
      <div
        className="relative w-full bg-black"
        style={{ aspectRatio: "9 / 16" }}
      >
        <video
          src={reel.videoUrl}
          poster={reel.thumbUrl}
          controls
          preload="none"
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Language badge sits on the video, top-left */}
        <span
          className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold tracking-[0.16em] uppercase"
          style={{
            color: "white",
            background: "rgba(15,23,42,0.7)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(4px)",
          }}
        >
          {reel.lang.toUpperCase()}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-[var(--c-text)] leading-snug mb-1.5">
          {reel.title}
        </h3>
        <p className="text-xs text-[var(--c-text-muted)] leading-relaxed line-clamp-3">
          {reel.description}
        </p>
      </div>
    </Card>
  );
}
