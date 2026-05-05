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
import { Heading } from "@components/ui/Heading";
import {
  FILMS,
  SEASONS,
  type Season,
  getFilmsBySeason,
} from "@lib/cinematicUniverse";

export const metadata: Metadata = {
  title: "Cinematic Universe — 20 Films Across 4 Seasons",
  description:
    "From The Problem to The Movement — the full TurboLoop story told in 20 films. Watch each season free.",
  alternates: { canonical: "https://turboloop.tech/films" },
  openGraph: {
    title: "TurboLoop Cinematic Universe",
    description:
      "20 films. 4 seasons. One story — from The Problem to The Movement.",
    url: "https://turboloop.tech/films",
    type: "website",
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
    </main>
  );
}
