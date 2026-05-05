// /community — voices, leaderboard, featured contributions.
// Static data (testimonialsData) + build-time tRPC fetch for approved
// submissions and leaderboard.

import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, MessageCircle, Send as TelegramIcon, Globe2 } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { TESTIMONIALS } from "@lib/testimonialsData";
import { COUNTRY_DATA, getFlagUrl } from "@lib/constants";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Community — TurboLoop Around the World",
  description:
    "Voices from the TurboLoop community across 14+ countries on 6 continents. Daily Zoom sessions in 12+ languages. Always open.",
  alternates: { canonical: "https://turboloop.tech/community" },
};

export default function CommunityPage() {
  // Limit testimonials shown on the page to avoid an enormous list.
  const featured = TESTIMONIALS.slice(0, 12);

  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="The Community"
        title="Voices from everywhere."
        subtitle="14+ countries. 6 continents. 12+ languages. The TurboLoop community is global by design — geography no longer determines your financial destiny."
      />

      <Container width="default">
        {/* Top countries leaderboard */}
        <section className="mb-12 md:mb-16">
          <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
            <div>
              <Heading
                tier="eyebrow"
                className="text-[var(--c-brand-cyan)] mb-2 inline-block"
              >
                Where it&rsquo;s growing
              </Heading>
              <Heading tier="h1">Top communities, this week.</Heading>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COUNTRY_DATA.slice(0, 8).map((country, idx) => (
              <Card
                key={country.country}
                elevation="raised"
                padding="md"
                className="flex items-center gap-3"
              >
                <div className="text-2xl font-extrabold text-[var(--c-text-subtle)] w-6 text-center flex-shrink-0">
                  {idx + 1}
                </div>
                <img
                  src={getFlagUrl(country.code, 80)}
                  alt={`${country.country} flag`}
                  width={36}
                  height={26}
                  className="rounded-sm flex-shrink-0 object-cover"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[var(--c-text)]">
                    {country.country}
                  </div>
                  <div className="text-xs text-[var(--c-text-muted)] truncate">
                    {country.description}
                  </div>
                </div>
                {country.medal !== "none" && (
                  <Trophy
                    className="w-5 h-5 flex-shrink-0"
                    style={{
                      color:
                        country.medal === "gold"
                          ? "#F59E0B"
                          : country.medal === "silver"
                            ? "#94A3B8"
                            : "#CD7F32",
                    }}
                  />
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-12 md:mb-16">
          <div className="text-center mb-8 md:mb-10">
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-2 inline-block"
            >
              Voices
            </Heading>
            <Heading tier="h1">In their own words.</Heading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {featured.map(t => (
              <Card
                key={t.id}
                elevation="raised"
                padding="md"
                className="flex flex-col"
              >
                <blockquote className="text-base text-[var(--c-text)] leading-relaxed mb-4 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="pt-3 border-t border-[var(--c-border)] flex items-center gap-2">
                  {t.countryCode && (
                    <img
                      src={getFlagUrl(t.countryCode, 40)}
                      alt=""
                      width={20}
                      height={14}
                      className="rounded-sm flex-shrink-0 object-cover"
                      loading="lazy"
                      aria-hidden="true"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[var(--c-text)] truncate">
                      {t.name}
                    </div>
                    <div className="text-xs text-[var(--c-text-muted)] truncate">
                      {t.role}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Join section */}
        <Card
          elevation="prominent"
          padding="lg"
          className="text-center md:text-left md:flex md:items-center md:justify-between md:gap-8 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 -z-10 opacity-10"
            style={{ background: "var(--c-brand-gradient)" }}
            aria-hidden="true"
          />
          <div className="md:flex-1">
            <Heading tier="h2" className="mb-3">
              <Globe2 className="inline-block w-7 h-7 mr-2 text-[var(--c-brand-cyan)]" />
              Daily Zoom in 12+ languages.
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed mb-4 md:mb-0">
              Hop into a community session in your language. Learn,
              question, get onboarded. No hard sell — just real
              conversation.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0 flex-shrink-0">
            <a
              href="https://t.me/TurboLoop_Official"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
            >
              <TelegramIcon className="w-4 h-4" />
              Join Telegram
            </a>
            <Link
              href="/submit"
              className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] transition active:scale-[0.985]"
            >
              <MessageCircle className="w-4 h-4" />
              Share Story
            </Link>
          </div>
        </Card>
      </Container>
    </main>
  );
}
