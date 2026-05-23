// /reels/[slug] — single short-form video page (9:16 portrait).
//
// Polished as part of Turn 7 of the content restructure. Migrated from
// the old api.videos() tRPC fetch to the new fetchAllReels() DB-driven
// helper (lib/reelsApi.ts), and the action bar now uses the same
// /api/download proxy + Web Share API pattern as the films detail
// page. NEW badge added to the player area.
//
// Forced dark mode — media-page exception, consistent with /films.

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Container } from "@components/ui/Container";
import { NewBadge } from "@components/ui/NewBadge";
import { FilmActionBar } from "@components/films/FilmActionBar";
import { VideoObjectJsonLd } from "@components/seo/StructuredData";
import { fetchAllReels, shouldShowNewBadge } from "@lib/reelsApi";
import { ReelPlayer } from "./ReelPlayer";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const reels = await fetchAllReels();
  return reels.map(r => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const reels = await fetchAllReels();
  const reel = reels.find(r => r.slug === slug);
  if (!reel) return { title: "Reel not found" };
  const url = `https://www.turboloop.tech/reels/${slug}`;
  const desc = reel.tagline || `${reel.title} — a short on TurboLoop.`;
  return {
    title: `${reel.title} — TurboLoop Reels`,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: reel.title,
      description: desc,
      url,
      type: "video.other",
      images: [
        { url: reel.thumbUrl, width: 1080, height: 1920, alt: reel.title },
      ],
      videos: [
        {
          url: reel.directUrl,
          type: "video/mp4",
          width: 1080,
          height: 1920,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: reel.title,
      description: desc,
      images: [reel.thumbUrl],
    },
  };
}

export default async function ReelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const reels = await fetchAllReels();
  const reel = reels.find(r => r.slug === slug);
  if (!reel) notFound();

  // Next/prev by created_at adjacency (newest-first list — "next" is
  // the slug after this one in the array, "prev" is before).
  const idx = reels.findIndex(r => r.slug === slug);
  const others = reels.filter(r => r.slug !== slug).slice(0, 6);
  const showNew = shouldShowNewBadge(reel);
  const detailUrl = `https://www.turboloop.tech/reels/${slug}`;

  return (
    <main
      className="dark min-h-screen relative"
      style={{
        background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
      }}
    >
      {/* VideoObject JSON-LD — feeds Google Video Search and unlocks
          the "video" rich-result format in regular search. Description
          falls back to title when tagline is empty. */}
      <VideoObjectJsonLd
        name={reel.title}
        description={reel.tagline || reel.title}
        thumbnailUrl={reel.thumbUrl}
        uploadDate={reel.createdAt}
        contentUrl={reel.directUrl}
      />

      <Container width="wide" className="pt-6 md:pt-10 pb-12 md:pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        <div className="grid md:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Player */}
          <div className="md:col-span-3 relative">
            <ReelPlayer
              reel={{ id: reel.id, title: reel.title, directUrl: reel.directUrl }}
              thumb={reel.thumbUrl}
            />
            <NewBadge
              show={showNew}
              size="md"
              className="absolute top-3 right-3 z-20"
            />
          </div>

          {/* Info + more reels */}
          <div className="md:col-span-2 text-white">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3">
              {reel.title}
            </h1>
            {reel.tagline && (
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                {reel.tagline}
              </p>
            )}

            <FilmActionBar
              url={detailUrl}
              title={reel.title}
              shareContext={reel.tagline}
              downloadUrl={reel.directUrl}
              downloadFilename={reel.slug}
            />

            <a
              href="https://turboloop.io"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 w-full px-5 h-12 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
            >
              Launch App →
            </a>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="text-[0.6875rem] tracking-[0.2em] uppercase text-white/40 mb-3 font-bold">
                More Reels
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {others.map(o => (
                  <Link
                    key={o.id}
                    href={`/reels/${o.slug}`}
                    className="group relative rounded-md overflow-hidden block"
                    style={{ aspectRatio: "9 / 16" }}
                  >
                    <Image
                      src={o.thumbUrl}
                      alt={o.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 text-white text-[10px] font-semibold leading-tight line-clamp-2">
                      {o.title}
                    </div>
                    {shouldShowNewBadge(o) && (
                      <NewBadge show className="absolute top-1.5 right-1.5" />
                    )}
                  </Link>
                ))}
              </div>
              <Link
                href="/library"
                className="mt-4 inline-flex items-center text-sm text-cyan-300 hover:text-cyan-200 font-bold"
              >
                See all reels in the library
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
