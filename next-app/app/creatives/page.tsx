// /creatives — 141 ready-to-share branded banners. Fully static.
//
// Content data ships in the bundle (it's just text + R2 URLs — small).
// Visitors browse by category, click an image to copy the URL or
// download. The actual banner images load lazily as they scroll.

import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import {
  ALL_CREATIVES,
  CREATIVE_CATEGORIES,
} from "@lib/creativesData";

export const metadata: Metadata = {
  title: "Creatives — 141 Ready-to-Share Banners",
  description:
    "141 designed banners with captions, organized by ecosystem pillar. Free for the community to share on Telegram, X, WhatsApp.",
  alternates: { canonical: "https://turboloop.tech/creatives" },
};

export default function CreativesPage() {
  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="Branded Library"
        title="141 banners. Ready to share."
        subtitle="Pre-designed images with captions, grouped by ecosystem pillar. Free to share on Telegram, X, WhatsApp — no attribution required."
      />

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
                  <a
                    key={banner.slug}
                    href={banner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-[var(--r-lg)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-lg)] hover:-translate-y-0.5 transition active:scale-[0.99]"
                  >
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: "1 / 1" }}
                    >
                      <Image
                        src={banner.url}
                        alt={banner.headline ?? `${cat.label} banner`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    {banner.headline && (
                      <div className="p-3">
                        <div
                          className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase mb-1"
                          style={{ color: banner.palette.from }}
                        >
                          {cat.label}
                        </div>
                        <div className="text-xs font-semibold text-[var(--c-text)] line-clamp-2">
                          {banner.headline}
                        </div>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </Container>
    </main>
  );
}
