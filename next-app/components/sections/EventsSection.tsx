// EventsSection — daily Zoom community sessions, in-language community
// calls, presenter onboarding info. Static (the schedule doesn't change
// week-to-week; specific dates link out to Telegram for the live link).

import {
  Calendar,
  Globe2,
  Users,
  Mic,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";

const SESSION_TYPES = [
  {
    icon: Calendar,
    label: "Daily community calls",
    detail:
      "Open Zoom in 12+ languages — English, Hindi, Indonesian, Portuguese, Russian, Turkish, Spanish + more. Drop in any time.",
    color: "#0891B2",
  },
  {
    icon: Mic,
    label: "Local presenters",
    detail:
      "Native speakers run the calls in your language. We pay them $100/month — apply at /apply.",
    color: "#7C3AED",
  },
  {
    icon: Users,
    label: "Onboarding sessions",
    detail:
      "Brand-new to DeFi? Smaller group calls walk you through wallet setup, your first deposit, and the math.",
    color: "#10B981",
  },
];

export function EventsSection() {
  return (
    <section className="py-12 md:py-20">
      <Container width="default">
        <div className="text-center mb-8 md:mb-10">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-brand-cyan)] mb-3 inline-block"
          >
            Live & Daily
          </Heading>
          <Heading tier="h1">
            Daily Zoom in <span className="text-brand-wide">12+ languages.</span>
          </Heading>
          <p className="mt-4 text-[var(--c-text-muted)] max-w-2xl mx-auto leading-relaxed">
            The community runs free Zoom sessions every single day. Drop in,
            ask anything, get onboarded. No pitch, no pressure, real
            conversations in your language.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8">
          {SESSION_TYPES.map(s => {
            const Icon = s.icon;
            return (
              <Card key={s.label} elevation="raised" padding="lg">
                <div
                  className="w-12 h-12 rounded-[var(--r-lg)] flex items-center justify-center mb-4"
                  style={{
                    background: `${s.color}15`,
                    color: s.color,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <Heading tier="title" as="h3" className="text-base mb-2">
                  {s.label}
                </Heading>
                <p className="text-sm text-[var(--c-text-muted)] leading-relaxed">
                  {s.detail}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Single CTA strip */}
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
            <Heading tier="h2" className="mb-2">
              <Globe2 className="inline-block w-6 h-6 mr-2 text-[var(--c-brand-cyan)]" />
              Find your call.
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed">
              Live links go up daily in our official Telegram. Pick your
              language, hop in.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0 flex-shrink-0">
            <a
              href="https://t.me/TurboLoop_Official"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
            >
              <MessageCircle className="w-4 h-4" />
              Open Telegram
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="/apply"
              className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] transition active:scale-[0.985]"
            >
              <Mic className="w-4 h-4" />
              Become a presenter
            </a>
          </div>
        </Card>
      </Container>
    </section>
  );
}
