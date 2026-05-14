// /careers — open roles. Right now: two Zoom Presenter listings
// (Indonesian and German). Applications go through the existing
// submissions.submit mutation with type="presenter_apply" so they
// land in the same admin moderation queue as Local Presenter apps.

import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { CareersApplicationForm } from "@components/careers/CareersApplicationForm";

const OG_TITLE = "Careers — TurboLoop";
const OG_DESC =
  "Open roles at TurboLoop. Zoom Presenter (Indonesian / German) — host community calls, get paid in stablecoins.";
const OG_IMAGE =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-apply.png";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  alternates: { canonical: "https://turboloop.tech/careers" },
  openGraph: {
    title: OG_TITLE,
    description: OG_DESC,
    url: "https://turboloop.tech/careers",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESC,
    images: [OG_IMAGE],
  },
};

const ROLES = [
  {
    id: "presenter-id",
    flag: "🇮🇩",
    title: "Indonesian Zoom Presenter",
    location: "Remote · Bahasa Indonesia",
    stipend: "$100 / month",
    bullets: [
      "Host weekly community Zoom sessions in Bahasa Indonesia.",
      "Walk new members through wallet setup, deposit, and yield mechanics.",
      "Coordinate with the global presenter team via Telegram.",
      "Minimum: comfortable with public speaking + active local crypto community of 40+ contacts.",
    ],
  },
  {
    id: "presenter-de",
    flag: "🇩🇪",
    title: "German Zoom Presenter",
    location: "Remote · Deutsch",
    stipend: "$100 / month",
    bullets: [
      "Host weekly community Zoom sessions in Deutsch.",
      "Walk new members through wallet setup, deposit, and yield mechanics.",
      "Coordinate with the global presenter team via Telegram.",
      "Minimum: comfortable with public speaking + active local crypto community of 40+ contacts.",
    ],
  },
];

export default function CareersPage() {
  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="We're Hiring"
        title="Host the call. Get paid."
        subtitle="Two open seats on the global presenter team — Indonesian and German. Lead weekly community Zoom sessions and we'll cover your operating costs each month."
      />

      <Container width="default">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-10 md:mb-14">
          {ROLES.map(role => (
            <Card
              key={role.id}
              elevation="prominent"
              padding="lg"
              className="relative overflow-hidden h-full flex flex-col"
            >
              <div
                className="absolute inset-0 -z-10 opacity-10 pointer-events-none"
                style={{ background: "var(--c-brand-gradient)" }}
                aria-hidden="true"
              />
              <div className="text-3xl mb-3" aria-hidden="true">
                {role.flag}
              </div>
              <Heading tier="title" as="h2" className="mb-1">
                {role.title}
              </Heading>
              <div className="text-xs text-[var(--c-text-muted)] mb-4">
                {role.location}
              </div>
              <div className="mb-4">
                <div className="bg-brand bg-clip-text text-transparent text-3xl font-extrabold tracking-tight leading-none tabular-nums">
                  {role.stipend}
                </div>
                <div className="text-[0.6875rem] font-bold tracking-[0.16em] uppercase text-[var(--c-text-subtle)] mt-1">
                  Stipend
                </div>
              </div>
              <ul className="space-y-1.5 mb-5">
                {role.bullets.map(b => (
                  <li
                    key={b}
                    className="text-sm text-[var(--c-text-muted)] leading-snug flex items-start gap-2"
                  >
                    <span
                      className="text-[var(--c-brand-cyan)] mt-0.5 shrink-0"
                      aria-hidden="true"
                    >
                      →
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <a
                href="#apply"
                className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985] mt-auto self-start"
              >
                Apply for this role →
              </a>
            </Card>
          ))}
        </div>

        <section id="apply" className="scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-6 md:mb-8">
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-3 inline-block"
            >
              Application
            </Heading>
            <Heading tier="h2" as="h2" className="mb-2">
              Tell us about you.
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed">
              Reviews happen weekly. Approved presenters get a Telegram
              DM with onboarding within 7 days.
            </p>
          </div>
          <CareersApplicationForm />
        </section>

        <p className="text-center text-sm text-[var(--c-text-muted)] mt-10">
          Not a presenter role?{" "}
          <Link
            href="/apply"
            className="font-bold text-[var(--c-brand-cyan)] hover:underline"
          >
            See all earning programs
          </Link>{" "}
          or{" "}
          <Link
            href="/events"
            className="font-bold text-[var(--c-brand-cyan)] hover:underline"
          >
            host a paid meetup
          </Link>
          .
        </p>
      </Container>
    </main>
  );
}
