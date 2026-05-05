// "Watch The Movement" — horizontal scrollable carousel of reels on
// the homepage. Build-time fetch from the legacy tRPC endpoint.

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ChevronRight, Play } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { api } from "@lib/api";

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

export async function HomeReelsSection() {
  let reels: Array<{ id: number; title: string; slug: string; thumb: string }> = [];
  try {
    const videos = await api.videos();
    reels = videos
      .filter(v => v.directUrl)
      .map(v => ({
        id: v.id,
        title: v.title,
        slug: slugFromUrl(v.directUrl!) ?? "",
        thumb: thumbForReel(v.directUrl!),
      }))
      .filter(r => r.slug)
      .slice(0, 8);
  } catch {
    // If the API is down at build time, render nothing rather than break.
    return null;
  }

  if (reels.length === 0) return null;

  return (
    <section className="py-12 md:py-20 overflow-hidden">
      <Container width="wide">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 md:mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--c-brand-purple)]" />
              <span className="text-[0.625rem] font-bold tracking-[0.2em] uppercase text-[var(--c-brand-purple)]">
                New Reels
              </span>
            </div>
            <Heading tier="h1">
              Watch the <span className="text-brand-wide">Movement.</span>
            </Heading>
            <p className="text-[var(--c-text-muted)] mt-2 max-w-xl">
              Short explainers on why TurboLoop is the safest, most transparent
              yield protocol in DeFi.
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

      {/* Horizontal scroll. Container is flush so reels can run edge-to-edge. */}
      <div className="overflow-x-auto pb-4 px-[var(--gutter)] scrollbar-hide">
        <div className="flex gap-3 md:gap-4 snap-x snap-mandatory">
          {reels.map(r => (
            <Link
              key={r.id}
              href={`/reels/${r.slug}`}
              className="group relative shrink-0 snap-start rounded-[var(--r-xl)] overflow-hidden block bg-[var(--c-surface)] shadow-[var(--s-md)] hover:shadow-[var(--s-lg)] transition active:scale-[0.99]"
              style={{ width: "min(220px, 60vw)", aspectRatio: "9 / 16" }}
            >
              <Image
                src={r.thumb}
                alt={r.title}
                fill
                sizes="220px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-black/30" />
              {/* Play indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
                  style={{ background: "rgba(255,255,255,0.95)" }}
                >
                  <Play className="w-4 h-4 ml-0.5 fill-current text-[var(--c-brand-cyan)]" />
                </div>
              </div>
              {/* Reel badge */}
              <div
                className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[0.625rem] font-bold tracking-[0.18em] uppercase"
                style={{ background: "rgba(255,255,255,0.95)", color: "#0F172A" }}
              >
                ▸ Reel
              </div>
              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h4 className="text-xs font-bold leading-snug line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  {r.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Container width="wide" className="md:hidden mt-2">
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
