// HiringBanner — slim "We're Hiring" strip on the homepage.
//
// Now reads from the job_vacancies table via api.openCareers(). Three
// behavioural branches:
//   • 0 open roles → returns null, section is hidden entirely
//   • 1 open role  → "Open seat: <flag> <title>"
//   • 2+ roles     → "Zoom Presenters — <flag1> <lang1> & <flag2> <lang2>"
//                    if all 2 roles look like presenter roles (slug
//                    starts with "presenter-"); otherwise the generic
//                    "<count> open seats" message
//
// Async server component — no client JS, no hydration cost. The
// homepage <HiringBanner /> mount remains unconditional; this
// component decides internally whether to render.

import Link from "next/link";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { Briefcase, ArrowRight } from "lucide-react";
import { api, type JobVacancy } from "@lib/api";

/** Pulls the headline string from the active openings list. */
function headlineForRoles(roles: JobVacancy[]): string {
  if (roles.length === 1) {
    const r = roles[0];
    return r.flag ? `${r.flag} ${r.title}` : r.title;
  }
  // 2+. If they're all presenter roles, summarise by language; the
  // existing visual identity ("Zoom Presenters — Indonesian & German")
  // was the established homepage banner copy.
  const allPresenters = roles.every(r => r.slug.startsWith("presenter-"));
  if (allPresenters && roles.length <= 4) {
    const langs = roles
      .map(r => {
        // Pull the language label from the title's "Zoom Presenter —
        // <Language>" suffix. Falls back to the slug suffix if the
        // title doesn't follow that pattern.
        const m = r.title.match(/—\s*(.+)$/);
        const label = m ? m[1].trim() : r.slug.replace(/^presenter-/i, "").toUpperCase();
        return r.flag ? `${r.flag} ${label}` : label;
      })
      .join(" & ");
    return `Zoom Presenters — ${langs}.`;
  }
  return `${roles.length} open seats on the global team.`;
}

/** Headline copy under the section title — adapts to plurality. */
function subtitleForRoles(roles: JobVacancy[]): string {
  // Use the most common stipend value across open roles. If they all
  // agree (typical), the line reads cleanly; otherwise it falls back to
  // a generic "competitive stipends" phrasing.
  const stipends = new Set(roles.map(r => r.stipend));
  if (stipends.size === 1) {
    const stipend = [...stipends][0];
    return `${stipend} for hosting weekly community calls in your language. We provide the deck and the support — you bring the room.`;
  }
  return "Competitive stipends for hosting weekly community calls in your language. We provide the deck and the support — you bring the room.";
}

export async function HiringBanner() {
  const roles = await api.openCareers();

  // No open roles → hide the section entirely. The homepage layout
  // collapses naturally because this is a section component; no parent
  // layout assumes it's always present.
  if (roles.length === 0) return null;

  const headline = headlineForRoles(roles);
  const subtitle = subtitleForRoles(roles);

  return (
    <section className="py-8 md:py-12">
      <Container width="default">
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
              <Briefcase className="w-3 h-3" />
              We&rsquo;re Hiring
            </div>
            <Heading tier="h2" className="mb-2">
              {headline}
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed max-w-xl">
              {subtitle}
            </p>
          </div>
          {/* Two CTAs: primary Apply on /apply (the programs hub +
              form), secondary "See roles" on /careers for the
              role-specific listings. */}
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0 flex-shrink-0">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
            >
              Apply now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 px-4 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] transition active:scale-[0.985]"
            >
              See {roles.length === 1 ? "role" : "roles"}
            </Link>
          </div>
        </Card>
      </Container>
    </section>
  );
}
