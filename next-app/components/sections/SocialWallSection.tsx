// SocialWallSection — masonry-ish grid of community voices.
//
// Pulls approved testimonials from the submissions.publicApproved tRPC
// query at build time (ISR every 5 min). Falls back to the static
// TESTIMONIALS pool when the API is unreachable, the DB has no approved
// rows yet, or every approved row is filtered out (we only render
// type="testimonial" submissions — photo/reel/story need different layouts).
//
// Server component — zero client JS shipped.

import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { TESTIMONIALS, type Testimonial } from "@lib/testimonialsData";
import { COUNTRY_DATA, getFlagUrl } from "@lib/constants";
import { api } from "@lib/api";
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

/** Map a country *name* (as stored in submissions.authorCountry) to the
 *  ISO code our flag CDN expects. Unknown country names render without a
 *  flag rather than a broken image. */
const COUNTRY_NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  COUNTRY_DATA.map(c => [c.country.toLowerCase(), c.code])
);

function codeForCountry(name: string | null): string | null {
  if (!name) return null;
  return COUNTRY_NAME_TO_CODE[name.trim().toLowerCase()] ?? null;
}

async function loadWall(): Promise<Testimonial[]> {
  try {
    const rows = await api.publicApprovedSubmissions();
    const testimonialsOnly = (rows ?? []).filter(
      r => r.type === "testimonial"
    );
    if (testimonialsOnly.length === 0) throw new Error("no approved testimonials");
    return testimonialsOnly.slice(0, 9).map((r, i) => ({
      id: `db-${r.id}`,
      quote: r.body,
      name: r.authorName,
      role: r.authorCountry ?? "",
      countryCode: codeForCountry(r.authorCountry) ?? "",
      color: "#0891B2",
      hoursAgo: i,
    }));
  } catch {
    return TESTIMONIALS.slice(0, 9);
  }
}

export async function SocialWallSection() {
  const wall = await loadWall();

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
