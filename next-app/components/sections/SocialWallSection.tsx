// SocialWallSection — Video Social Wall.
//
// Server component that fetches approved YouTube videos from
// socialWall.publicList (ISR every 5 min) + approved testimonial-type
// content submissions (kept as a sub-section "Our Creators Worldwide"
// to retain the original community voices). Falls back gracefully
// when no approved videos exist yet — the section becomes a creator
// CTA instead of a blank grid.

import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { TESTIMONIALS, type Testimonial } from "@lib/testimonialsData";
import { COUNTRY_DATA, getFlagUrl } from "@lib/constants";
import { api, type SocialWallVideo } from "@lib/api";
import { Send as TelegramIcon, Twitter, MessageCircle } from "lucide-react";
import { SocialWallSubmitForm } from "@components/sections/SocialWallSubmitForm";

const PLATFORM_META: Record<
  string,
  { icon: typeof TelegramIcon; color: string }
> = {
  default: { icon: MessageCircle, color: "#0891B2" },
};

const COUNTRY_NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  COUNTRY_DATA.map(c => [c.country.toLowerCase(), c.code])
);

function codeForCountry(name: string | null): string | null {
  if (!name) return null;
  return COUNTRY_NAME_TO_CODE[name.trim().toLowerCase()] ?? null;
}

async function loadVideos(): Promise<SocialWallVideo[]> {
  try {
    return await api.socialWallVideos();
  } catch {
    return [];
  }
}

async function loadCreatorVoices(): Promise<Testimonial[]> {
  try {
    const rows = await api.publicApprovedSubmissions();
    const t = (rows ?? []).filter(r => r.type === "testimonial");
    if (t.length === 0) throw new Error("empty");
    return t.slice(0, 6).map((r, i) => ({
      id: `db-${r.id}`,
      quote: r.body,
      name: r.authorName,
      role: r.authorCountry ?? "",
      countryCode: codeForCountry(r.authorCountry) ?? "",
      color: "#0891B2",
      hoursAgo: i,
    }));
  } catch {
    return TESTIMONIALS.slice(0, 6);
  }
}

export async function SocialWallSection() {
  const [videos, voices] = await Promise.all([
    loadVideos(),
    loadCreatorVoices(),
  ]);

  return (
    <section className="py-12 md:py-20">
      <Container width="default">
        <div className="text-center mb-8 md:mb-10">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-brand-cyan)] mb-3 inline-block"
          >
            The Social Wall
          </Heading>
          <Heading tier="h1" as="h2">
            Voices from <span className="text-brand-wide">everywhere.</span>
          </Heading>
          <p className="mt-4 text-[var(--c-text-muted)] max-w-2xl mx-auto leading-relaxed">
            Community-made videos and stories — curated, free to watch,
            and ready to share.
          </p>
        </div>

        {/* ── Video grid ──────────────────────────────────────────── */}
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-12 md:mb-16 auto-rows-fr">
            {videos.map(v => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        ) : (
          // Empty state — once admin approves a few via the new Social
          // Wall admin tab, this disappears and the grid takes over.
          <Card
            elevation="raised"
            padding="lg"
            className="text-center max-w-2xl mx-auto mb-12 md:mb-16"
          >
            <div className="text-3xl mb-3" aria-hidden="true">
              🎬
            </div>
            <Heading tier="title" as="h3" className="mb-2">
              The wall is warming up.
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed">
              Submit your TurboLoop content below — approved videos
              show up here.
            </p>
          </Card>
        )}

        {/* ── Creator voices sub-section — kept for the community story */}
        {voices.length > 0 && (
          <div className="mb-12 md:mb-16">
            <div className="flex items-end justify-between gap-3 flex-wrap mb-5 md:mb-6">
              <Heading tier="title" as="h3" className="text-lg">
                Our Creators Worldwide
              </Heading>
              <a
                href="/community"
                className="text-sm font-bold text-[var(--c-brand-cyan)] hover:underline"
              >
                See all →
              </a>
            </div>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 md:gap-5 [&>*]:mb-4 md:[&>*]:mb-5">
              {voices.map(t => {
                const meta = PLATFORM_META.default;
                const Icon = meta.icon;
                return (
                  <Card
                    key={t.id}
                    elevation="raised"
                    padding="md"
                    className="break-inside-avoid"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          background: `${meta.color}15`,
                          color: meta.color,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {t.countryCode && (
                        <img
                          src={getFlagUrl(t.countryCode, 40)}
                          alt=""
                          width={20}
                          height={14}
                          loading="lazy"
                          className="rounded-sm flex-shrink-0 object-cover"
                          aria-hidden
                        />
                      )}
                      <div className="text-xs font-bold text-[var(--c-text)] truncate">
                        {t.name}
                      </div>
                    </div>
                    <blockquote className="text-sm text-[var(--c-text)] leading-relaxed">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    {t.role && (
                      <div className="mt-3 text-[0.6875rem] text-[var(--c-text-muted)] tracking-wide">
                        {t.role}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Submit Your Content (client island) ─────────────────── */}
        <SocialWallSubmitForm />
      </Container>
    </section>
  );
}

/** Single video tile — 16:9 YouTube embed (lite) with a caption strip. */
function VideoCard({ video }: { video: SocialWallVideo }) {
  // Use the official YouTube embed; preload="none" isn't an iframe
  // option but YouTube's nocookie domain keeps cookies + tracking at
  // bay until the user actually presses play.
  const embedSrc = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&modestbranding=1`;
  return (
    <Card
      elevation="raised"
      padding="none"
      interactive
      className={`overflow-hidden h-full flex flex-col ${
        video.featured ? "ring-2 ring-[var(--c-brand-cyan)] ring-offset-2 ring-offset-[var(--c-bg)]" : ""
      }`}
    >
      <div
        className="relative w-full bg-black"
        style={{ aspectRatio: "16 / 9" }}
      >
        <iframe
          src={embedSrc}
          title={video.title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
        {video.featured && (
          <span
            className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold tracking-[0.16em] uppercase"
            style={{
              color: "white",
              background: "var(--c-brand-gradient)",
              boxShadow: "0 0 12px rgba(34,211,238,0.45)",
            }}
          >
            Featured
          </span>
        )}
      </div>
      <div className="p-4 flex-1">
        <h4 className="text-sm font-bold text-[var(--c-text)] leading-snug line-clamp-2 mb-1">
          {video.title}
        </h4>
        {video.channelTitle && (
          <p className="text-xs text-[var(--c-text-muted)] truncate">
            {video.channelTitle}
          </p>
        )}
      </div>
    </Card>
  );
}
