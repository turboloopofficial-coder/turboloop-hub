// /films/[slug] — single film detail page with embedded video player.
//
// Statically generated for all 20 films at build time via
// generateStaticParams. The video player is the only interactive bit
// (click to play); the rest is plain HTML.
//
// SEO is per-film: each page has its own OG tags pointing at the film's
// poster, so sharing a specific film URL on Telegram/X gives a dedicated
// preview rather than the homepage default.

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { ShareButton } from "@components/ShareButton";
import { DownloadButton } from "@components/DownloadButton";
import {
  FILMS,
  SEASONS,
  getFilm,
  getNextFilm,
  getPrevFilm,
} from "@lib/cinematicUniverse";
import { FilmPlayer } from "./FilmPlayer";

export const dynamicParams = false; // 404 for any slug not in FILMS

export function generateStaticParams() {
  return FILMS.map(f => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const film = getFilm(slug);
  if (!film) return { title: "Film not found" };
  const url = `https://turboloop.tech/films/${film.slug}`;
  return {
    title: `${film.title} — TurboLoop Cinematic Universe`,
    description: `${film.tagline} · ${film.headline}`,
    alternates: { canonical: url },
    openGraph: {
      title: film.title,
      description: film.tagline,
      url,
      type: "video.other",
      images: [
        {
          url: film.posterUrl,
          width: 1280,
          height: 720,
          alt: film.title,
        },
      ],
      videos: [
        {
          url: film.url,
          width: 1920,
          height: 1080,
          type: "video/mp4",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: film.title,
      description: film.tagline,
      images: [film.posterUrl],
    },
  };
}

export default async function FilmDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const film = getFilm(slug);
  if (!film) notFound();
  const seasonInfo = SEASONS[film.season];
  const next = getNextFilm(slug);
  const prev = getPrevFilm(slug);

  return (
    <main className="relative pb-12 md:pb-20">
      <Container width="wide" className="pt-6 md:pt-10">
        {/* Back link */}
        <Link
          href="/films"
          className="inline-flex items-center gap-2 text-sm text-[var(--c-text-muted)] hover:text-[var(--c-text)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All films
        </Link>

        {/* Title block */}
        <div className="max-w-3xl mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-4"
            style={{
              background: `${seasonInfo.accent}15`,
              color: seasonInfo.accent,
              border: `1px solid ${seasonInfo.accent}30`,
            }}
          >
            <span>{seasonInfo.emoji}</span>
            <span>
              S{film.season} · E{film.episode} · {seasonInfo.name.replace(/^Season \d+ — /, "")}
            </span>
          </div>
          <div
            className="text-sm md:text-base font-bold tracking-[0.18em] uppercase mb-3"
            style={{ color: seasonInfo.accent }}
          >
            {film.headline}
          </div>
          <Heading tier="h1" className="mb-3">
            {film.title}
          </Heading>
          <p className="text-lg text-[var(--c-text-muted)] leading-relaxed">
            {film.tagline}
          </p>
        </div>

        {/* Video player — client island */}
        <FilmPlayer film={film} />

        {/* Action row — Share + Download */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-5">
          <ShareButton
            path={`/films/${film.slug}`}
            message={`🎬 ${film.title} — ${film.tagline}`}
            variant="primary"
            label="Share film"
          />
          <DownloadButton
            url={film.url}
            title={film.title}
            extension="mp4"
            label="Download MP4"
          />
        </div>

        {/* Description */}
        <div className="max-w-3xl mt-10">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-text-subtle)] mb-3 inline-block"
          >
            About this film
          </Heading>
          <p className="text-base md:text-lg text-[var(--c-text)] leading-relaxed whitespace-pre-line">
            {film.description}
          </p>
        </div>

        {/* Prev / Next nav */}
        <nav className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-4">
          {prev ? (
            <Link
              href={`/films/${prev.slug}`}
              className="group flex items-center gap-4 p-4 md:p-5 rounded-[var(--r-xl)] bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-md)] hover:shadow-[var(--s-lg)] transition active:scale-[0.99]"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--c-text-muted)] flex-shrink-0" />
              <div className="relative w-20 h-12 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={prev.posterUrl}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-1">
                  Previous
                </div>
                <div className="text-sm font-bold text-[var(--c-text)] truncate">
                  {prev.title}
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/films/${next.slug}`}
              className="group flex items-center gap-4 p-4 md:p-5 rounded-[var(--r-xl)] bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-md)] hover:shadow-[var(--s-lg)] transition active:scale-[0.99] md:flex-row-reverse md:text-right"
            >
              <ChevronRight className="w-5 h-5 text-[var(--c-text-muted)] flex-shrink-0" />
              <div className="relative w-20 h-12 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={next.posterUrl}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-1">
                  Up next
                </div>
                <div className="text-sm font-bold text-[var(--c-text)] truncate">
                  {next.title}
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </Container>
    </main>
  );
}
