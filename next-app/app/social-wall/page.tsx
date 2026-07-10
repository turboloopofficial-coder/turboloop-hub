// /social-wall — dedicated page for the full Video Social Wall.
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Send, Sparkles } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { api, type SocialWallVideo } from "@lib/api";
import { getPageLocale } from "@lib/getPageLocale";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

const OG_TITLE = "Social Wall — Community Posts & Highlights | TurboLoop";
const OG_DESC =
  "Real posts from the TurboLoop community. See what members are sharing across Telegram, Twitter, and social media — curated, free to watch, ready to share.";
const OG_IMAGE =
  "https://www.turboloop.tech/api/og-banner?type=social-wall";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  alternates: { canonical: "https://www.turboloop.tech/social-wall" },
  openGraph: {
    type: "website",
    title: OG_TITLE,
    description: OG_DESC,
    url: "https://www.turboloop.tech/social-wall",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESC,
    images: [OG_IMAGE],
  },
};

async function loadVideos(): Promise<SocialWallVideo[]> {
  try {
    return await api.socialWallVideos();
  } catch {
    return [];
  }
}

export default async function SocialWallPage() {
  const locale = await getPageLocale();
  const t = await getTranslations({ locale, namespace: "social-wall" });
  const videos = await loadVideos();

  const jsonLd =
    videos.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: videos.map((v, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            url: `https://www.youtube.com/watch?v=${v.youtubeId}`,
            name: v.title,
          })),
        }
      : null;

  return (
    <main className="relative pb-12 md:pb-20">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <Container width="wide">
        <div className="mb-8 md:mb-12">
          <Card
            elevation="prominent"
            padding="lg"
            className="relative overflow-hidden text-center md:text-left md:flex md:items-center md:justify-between md:gap-8"
          >
            <div
              className="absolute inset-0 -z-10 opacity-10 pointer-events-none"
              style={{ background: "var(--c-brand-gradient)" }}
              aria-hidden="true"
            />
            <div className="md:flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand text-white text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-3 shadow-[var(--s-brand)]">
                <Sparkles className="w-3 h-3" />
                {t("submitBadge")}
              </div>
              <Heading tier="h2" className="mb-2">
                {t("submitHeading")}
              </Heading>
              <p className="text-[var(--c-text-muted)] leading-relaxed max-w-xl">
                {t("submitBody")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0 flex-shrink-0">
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
              >
                <Send className="w-4 h-4" />
                {t("submitBtn")}
              </Link>
              <Link
                href="/apply#creator"
                className="inline-flex items-center gap-2 px-4 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] transition active:scale-[0.985]"
              >
                {t("creatorPayouts")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>
        </div>

        {videos.length > 0 ? (
          <>
            <div className="flex items-baseline justify-between flex-wrap gap-3 mb-5 md:mb-6">
              <Heading tier="title" as="h2" className="text-lg">
                {videos.length}{" "}
                {videos.length === 1 ? t("videoSingular") : t("videoPlural")}
              </Heading>
              <div className="text-xs text-[var(--c-text-subtle)]">
                {t("refreshNote")}
              </div>
            </div>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-5 [&>*]:mb-4 md:[&>*]:mb-5">
              {videos.map(v => (
                <SocialWallTile key={v.id} video={v} featuredLabel={t("featuredBadge")} />
              ))}
            </div>
          </>
        ) : (
          <Card
            elevation="raised"
            padding="lg"
            className="text-center max-w-2xl mx-auto"
          >
            <div className="text-4xl mb-3" aria-hidden="true">
              🎬
            </div>
            <Heading tier="title" as="h3" className="mb-2">
              {t("emptyHeading")}
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed mb-5">
              {t("emptyBody")}
            </p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
            >
              <Send className="w-4 h-4" />
              {t("submitBtn")}
            </Link>
          </Card>
        )}
      </Container>
    </main>
  );
}

function SocialWallTile({ video, featuredLabel }: { video: SocialWallVideo; featuredLabel: string }) {
  const embedSrc = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&modestbranding=1`;
  return (
    <Card
      elevation="raised"
      padding="none"
      className={`overflow-hidden break-inside-avoid ${
        video.featured
          ? "ring-2 ring-[var(--c-brand-cyan)] ring-offset-2 ring-offset-[var(--c-bg)]"
          : ""
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
            {featuredLabel}
          </span>
        )}
      </div>
      <div className="p-4">
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
