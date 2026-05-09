// /creatives — 141 ready-to-share branded banners. Fully static.
//
// Content data ships in the bundle (it's just text + R2 URLs — small).
// Visitors browse by category, click an image to copy the URL or
// download. The actual banner images load lazily as they scroll.

import type { Metadata } from "next";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { BannerCard } from "@components/creatives/BannerCard";
import { CreativesCategoryNav } from "@components/creatives/CreativesCategoryNav";
import {
  ALL_CREATIVES,
  CREATIVE_CATEGORIES,
} from "@lib/creativesData";

const TITLE = `${ALL_CREATIVES.length}+ Ready-to-Share Banners — TurboLoop`;
const DESCRIPTION =
  "Pre-designed branded images with captions. Free for the community.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://turboloop.tech/creatives" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://turboloop.tech/creatives",
    images: [
      {
        url: "https://www.turboloop.tech/api/og-banner?type=creatives",
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://www.turboloop.tech/api/og-banner?type=creatives"],
  },
};

export default function CreativesPage() {
  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="Branded Library"
        title={`${ALL_CREATIVES.length} banners. Ready to share.`}
        subtitle="Pre-designed images with captions, grouped by ecosystem pillar. Free to share on Telegram, X, WhatsApp — no attribution required."
      />

      <CreativesCategoryNav categories={CREATIVE_CATEGORIES} />

      <Container width="wide">
        {CREATIVE_CATEGORIES.map(cat => {
          const items = ALL_CREATIVES.filter(c => c.categoryId === cat.id);
          if (items.length === 0) return null;
          // Each banner carries its own palette; sample the first one for
          // the section header tint so each category has a unique accent.
          const sectionPalette =
            items[0]?.palette ?? { from: "#0891B2", via: "#22D3EE", to: "#7C3AED" };
          return (
            <section
              key={cat.id}
              className="mb-12 md:mb-16 scroll-mt-20"
              id={cat.id}
            >
              <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
                <div>
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-2"
                    style={{
                      background: `${sectionPalette.from}15`,
                      color: sectionPalette.from,
                      border: `1px solid ${sectionPalette.from}30`,
                    }}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </div>
                  <Heading tier="h2">
                    {items.length} {items.length === 1 ? "banner" : "banners"}
                  </Heading>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {items.map(banner => (
                  <BannerCard key={banner.slug} banner={banner} catLabel={cat.label} />
                ))}
              </div>
            </section>
          );
        })}
      </Container>
    </main>
  );
}
