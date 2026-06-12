// /careers — open roles. Sources of truth, in order:
//   1. job_vacancies table via api.openCareers() — the CMS path; admin
//      manages roles in /admin → Careers
//   2. The FALLBACK_ROLES array below if the DB returns empty (fresh
//      env, transient API failure, etc.). Lets us deprecate the
//      hardcoded path safely once the table is seeded
//
// Applications still go through the existing submissions.submit
// mutation with type="presenter_apply"; the form now passes the
// selected role's slug + title in the body so admin can attribute
// each application to a specific vacancy.

import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { CareersApplicationForm } from "@components/careers/CareersApplicationForm";
import { api, type JobVacancy } from "@lib/api";

// ISR — admins can publish/close roles without redeploy. 5 min is the
// same cadence as /blog and /films.
export const revalidate = 300;

const OG_TITLE =
  "Careers — Join the TurboLoop Presenter Team | Remote Positions";
const OG_DESC =
  "Open positions at TurboLoop: Indonesian and German Zoom Presenters. $100/month stipend, remote work, lead weekly community sessions in your language.";
// Dedicated dynamic OG variant (added 2026-05-18). Previously shared
// hub-promo-apply.png with /apply, weakening brand-image
// disambiguation. Now each top-level page has its own canonical image.
const OG_IMAGE =
  "https://www.turboloop.tech/api/og-banner?type=careers";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  alternates: { canonical: "https://www.turboloop.tech/careers" },
  openGraph: {
    type: "website",
    title: OG_TITLE,
    description: OG_DESC,
    url: "https://www.turboloop.tech/careers",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESC,
    images: [OG_IMAGE],
  },
};

// Static fallback — used when the DB returns 0 rows (e.g. before the
// admin seeds the table). Once the table is populated, these are
// ignored. Keep slug values in sync with whatever the admin uses so
// existing submissions reference stable role IDs.
const FALLBACK_ROLES: Array<Pick<JobVacancy, "slug" | "flag" | "title" | "location" | "stipend" | "bullets" | "tgSupportLink">> = [
  {
    slug: "presenter-id",
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
    tgSupportLink: null,
  },
  {
    slug: "presenter-de",
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
    tgSupportLink: null,
  },
];

export default async function CareersPage() {
  const dbRoles = await api.openCareers();
  // Normalize to a single render shape regardless of source. DB roles
  // already match JobVacancy; fallback roles are partial but share the
  // fields the card + form need.
  const ROLES = dbRoles.length > 0 ? dbRoles : FALLBACK_ROLES;
  const seatLabel =
    ROLES.length === 0
      ? "No open seats this week"
      : `${ROLES.length} open ${ROLES.length === 1 ? "seat" : "seats"} on the global presenter team`;
  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="We're Hiring"
        title="Host the call. Get paid."
        subtitle={`${seatLabel}. Lead weekly community Zoom sessions and we'll cover your operating costs each month.`}
      />

      <Container width="default">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-10 md:mb-14">
          {ROLES.map(role => (
            <Card
              key={role.slug}
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
          <CareersApplicationForm
            roles={ROLES.map(r => ({
              slug: r.slug,
              title: r.title,
              flag: r.flag ?? null,
            }))}
          />
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
