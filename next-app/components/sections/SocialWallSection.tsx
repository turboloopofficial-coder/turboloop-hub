// SocialWallSection — masonry-ish grid of community voices. Pulls from
// the testimonials data (already in lib/testimonialsData.ts), shows
// 9 cards (3 columns desktop, 1 mobile), each with country flag, name,
// role, quote.
//
// Static. Server component. Zero client JS.

import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { TESTIMONIALS } from "@lib/testimonialsData";
import { getFlagUrl } from "@lib/constants";
import { Send as TelegramIcon, Twitter, MessageCircle } from "lucide-react";

const PLATFORM_META: Record<
  string,
  { icon: typeof TelegramIcon; color: string }
> = {
  telegram: { icon: TelegramIcon, color: "#229ED9" },
  twitter: { icon: Twitter, color: "#0F172A" },
  whatsapp: { icon: MessageCircle, color: "#25D366" },
  default: { icon: MessageCircle, color: "#0891B2" },
};

export function SocialWallSection() {
  // 9 testimonials, mixed lengths so the grid feels organic.
  const wall = TESTIMONIALS.slice(0, 9);

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
          <Heading tier="h1">
            Voices from <span className="text-brand-wide">everywhere.</span>
          </Heading>
          <p className="mt-4 text-[var(--c-text-muted)] max-w-2xl mx-auto leading-relaxed">
            Real members, real countries, real reactions — pulled from
            Telegram, X, WhatsApp groups, Zoom calls.
          </p>
        </div>

        {/* Masonry-ish grid using CSS columns. Each card sits naturally
            in the column flow without explicit layout JS. */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 md:gap-5 [&>*]:mb-4 md:[&>*]:mb-5">
          {wall.map(t => {
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

        <div className="mt-8 text-center">
          <a
            href="/community"
            className="inline-flex items-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] transition active:scale-[0.985]"
          >
            See more on /community →
          </a>
        </div>
      </Container>
    </section>
  );
}
