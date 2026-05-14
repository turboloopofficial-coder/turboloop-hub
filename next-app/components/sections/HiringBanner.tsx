// HiringBanner — slim "We're Hiring" strip on the homepage. Links to
// /careers. Static, server-component, no client JS.

import Link from "next/link";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { Briefcase, ArrowRight } from "lucide-react";

export function HiringBanner() {
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
              Zoom Presenters — Indonesian & German.
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed max-w-xl">
              $100 / month for hosting weekly community calls in your
              language. We provide the deck and the support — you
              bring the room.
            </p>
          </div>
          {/* Two CTAs: primary Apply on /apply (the programs hub +
              form), secondary "See roles" on /careers for the
              language-specific listings. */}
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
              See roles
            </Link>
          </div>
        </Card>
      </Container>
    </section>
  );
}
