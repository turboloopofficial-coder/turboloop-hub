// /library — videos + presentation decks in 48 languages.
// Build-time fetch from the legacy tRPC endpoint; revalidates every 10 min.

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Play,
  Film,
  Download,
  ExternalLink,
} from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { api } from "@lib/api";
import { LANGUAGE_FLAGS, getFlagUrl } from "@lib/constants";
import { FILMS } from "@lib/cinematicUniverse";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Content Library — Videos and Decks in 48 Languages",
  description:
    "Watch, learn, download. Cinematic films, video reels, and downloadable presentations in 48 languages.",
  alternates: { canonical: "https://turboloop.tech/library" },
};

function thumbForReel(videoUrl: string): string {
  try {
    const u = new URL(videoUrl);
    u.pathname = u.pathname
      .replace(/^\/reels\//, "/reel-thumbs/")
      .replace(/\.mp4$/i, ".jpg");
    return u.toString();
  } catch {
    return "";
  }
}

function slugFromUrl(videoUrl: string): string | null {
  try {
    const u = new URL(videoUrl);
    const m = u.pathname.match(/\/reels\/([a-z0-9-]+)\.mp4$/i);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export default async function LibraryPage() {
  const [presentations, videos] = await Promise.all([
    api.presentations(),
    api.videos(),
  ]);
  const reels = videos.filter(v => v.directUrl);
  const totalLanguages = new Set(presentations.map(p => p.language)).size;

  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="Watch & Learn"
        title="Everything in one library."
        subtitle={`${FILMS.length} cinematic films · ${reels.length} reels · ${presentations.length} presentations · ${totalLanguages || 48} languages.`}
      />

      <Container width="wide">
        {/* Films section */}
        <section className="mb-12 md:mb-16">
          <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
            <div>
              <Heading
                tier="eyebrow"
                className="text-[var(--c-brand-cyan)] mb-2 inline-block"
              >
                Cinematic Universe
              </Heading>
              <Heading tier="h1">{FILMS.length} films, 4 seasons.</Heading>
            </div>
            <Link
              href="/films"
              className="text-sm font-bold text-[var(--c-brand-cyan)] hover:underline"
            >
              See all films →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {FILMS.slice(0, 4).map(film => (
              <Link
                key={film.slug}
                href={`/films/${film.slug}`}
                className="group block rounded-[var(--r-xl)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-md)] hover:shadow-[var(--s-lg)] transition active:scale-[0.99]"
              >
                <div
                  className="relative w-full"
                  style={{ aspectRatio: "16 / 9" }}
                >
                  <Image
                    src={film.posterUrl}
                    alt={film.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-4 h-4 ml-0.5 fill-current text-[var(--c-brand-cyan)]" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)]">
                    S{film.season}E{film.episode}
                  </div>
                  <div className="text-sm font-bold text-[var(--c-text)] leading-snug line-clamp-2">
                    {film.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Reels section */}
        {reels.length > 0 && (
          <section className="mb-12 md:mb-16">
            <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
              <div>
                <Heading
                  tier="eyebrow"
                  className="text-[var(--c-brand-cyan)] mb-2 inline-block"
                >
                  Short-form Reels
                </Heading>
                <Heading tier="h1">{reels.length} reels.</Heading>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {reels.map(r => {
                const slug = slugFromUrl(r.directUrl!);
                if (!slug) return null;
                return (
                  <Link
                    key={r.id}
                    href={`/reels/${slug}`}
                    className="group block rounded-[var(--r-md)] overflow-hidden relative"
                    style={{ aspectRatio: "9 / 16" }}
                  >
                    <Image
                      src={thumbForReel(r.directUrl!)}
                      alt={r.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs font-semibold leading-tight line-clamp-2">
                      {r.title}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Presentations */}
        <section>
          <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
            <div>
              <Heading
                tier="eyebrow"
                className="text-[var(--c-brand-cyan)] mb-2 inline-block"
              >
                Presentation Decks
              </Heading>
              <Heading tier="h1">
                {presentations.length} decks · {totalLanguages || 48} languages.
              </Heading>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {presentations.map(pres => {
              const langCode = LANGUAGE_FLAGS[pres.language || ""] || "un";
              return (
                <Card
                  key={pres.id}
                  elevation="raised"
                  padding="md"
                  className="flex items-center gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-[var(--r-md)] bg-brand flex items-center justify-center shrink-0"
                  >
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[var(--c-text)] text-sm leading-snug line-clamp-2">
                      {pres.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <img
                        src={getFlagUrl(langCode, 20)}
                        alt={`${pres.language} flag`}
                        loading="lazy"
                        className="w-4 h-3 object-cover rounded-sm"
                      />
                      <span className="text-xs text-[var(--c-text-muted)]">
                        {pres.language}
                      </span>
                    </div>
                  </div>
                  {pres.fileUrl && (
                    <a
                      href={pres.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-[var(--r-md)] bg-[var(--c-bg)] text-[var(--c-text-muted)] hover:text-[var(--c-brand-cyan)] hover:bg-[var(--c-surface)] border border-[var(--c-border)] transition shrink-0"
                      aria-label={`Download ${pres.language} presentation`}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      </Container>
    </main>
  );
}
