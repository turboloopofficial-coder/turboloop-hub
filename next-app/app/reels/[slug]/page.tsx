// /reels/[slug] — single short-form video page (9:16 portrait).
//
// Dynamic param: slug → matches the videos.directUrl filename pattern
// (.../reels/<slug>.mp4).
//
// Build-time strategy: pre-build pages for every reel that has a
// directUrl. ISR revalidates so newly-published reels surface within
// minutes. dynamicParams: true so a brand-new reel is rendered on
// first visit even before the next rebuild.

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Container } from "@components/ui/Container";
import { ShareButton } from "@components/ShareButton";
import { DownloadButton } from "@components/DownloadButton";
import { api, type Video } from "@lib/api";
import { ReelPlayer } from "./ReelPlayer";

export const revalidate = 300;
export const dynamicParams = true;

function slugFromUrl(videoUrl: string): string | null {
  try {
    const u = new URL(videoUrl);
    const m = u.pathname.match(/\/reels\/([a-z0-9-]+)\.mp4$/i);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

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

async function getReels(): Promise<Array<Video & { _slug: string; _thumb: string }>> {
  const all = await api.videos();
  return all
    .filter(v => v.directUrl)
    .map(v => ({
      ...v,
      _slug: slugFromUrl(v.directUrl!) || "",
      _thumb: thumbForReel(v.directUrl!),
    }))
    .filter(v => v._slug);
}

export async function generateStaticParams() {
  const reels = await getReels();
  return reels.map(r => ({ slug: r._slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const reels = await getReels();
  const reel = reels.find(r => r._slug === slug);
  if (!reel) return { title: "Reel not found" };
  const url = `https://turboloop.tech/reels/${slug}`;
  return {
    title: `${reel.title} — TurboLoop Reels`,
    description: `${reel.title} — a short on TurboLoop, the complete DeFi ecosystem on Binance Smart Chain.`,
    alternates: { canonical: url },
    openGraph: {
      title: reel.title,
      description: `Watch this short on TurboLoop.`,
      url,
      type: "video.other",
      images: [
        {
          url: reel._thumb,
          width: 1080,
          height: 1920,
          alt: reel.title,
        },
      ],
      videos: reel.directUrl
        ? [
            {
              url: reel.directUrl,
              type: "video/mp4",
              width: 1080,
              height: 1920,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: reel.title,
      description: "Watch this short on TurboLoop.",
      images: [reel._thumb],
    },
  };
}

export default async function ReelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const reels = await getReels();
  const reel = reels.find(r => r._slug === slug);
  if (!reel || !reel.directUrl) notFound();

  const others = reels.filter(r => r._slug !== slug).slice(0, 6);

  return (
    <main
      className="min-h-screen relative"
      style={{
        background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
      }}
    >
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
          <div className="md:col-span-3">
            <ReelPlayer reel={reel} thumb={reel._thumb} />
          </div>

          {/* Info + more reels */}
          <div className="md:col-span-2 text-white">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3">
              {reel.title}
            </h1>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              A short explainer on why TurboLoop is the safest, most
              transparent yield protocol in DeFi.
            </p>

            {/* Share + Download row */}
            <div className="flex gap-2 mb-3">
              <ShareButton
                path={`/reels/${slug}`}
                message={`🎬 ${reel.title} — watch on Turbo Loop`}
                variant="primary"
                label="Share"
                className="flex-1"
              />
              <DownloadButton
                url={reel.directUrl}
                title={reel.title}
                extension="mp4"
                variant="ghost"
                label="Save"
              />
            </div>

            <a
              href="https://turboloop.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-5 h-12 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985] mb-3"
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
                    href={`/reels/${o._slug}`}
                    className="group relative rounded-md overflow-hidden block"
                    style={{ aspectRatio: "9 / 16" }}
                  >
                    <Image
                      src={o._thumb}
                      alt={o.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 text-white text-[10px] font-semibold leading-tight line-clamp-2">
                      {o.title}
                    </div>
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
