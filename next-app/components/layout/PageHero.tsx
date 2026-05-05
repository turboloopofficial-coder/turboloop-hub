// PageHero — shared header block for all non-home marketing pages.
// Eyebrow + title + subtitle. Mobile-first. Server-renderable.

import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Render the title as gradient (use sparingly, for high-impact pages) */
  gradientTitle?: boolean;
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  gradientTitle,
}: PageHeroProps) {
  return (
    <section className="relative pt-12 pb-8 md:pt-20 md:pb-12">
      <Container width="default">
        <div className="text-center max-w-2xl mx-auto">
          {eyebrow && (
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-3 inline-block"
            >
              {eyebrow}
            </Heading>
          )}
          <Heading tier="display" gradient={gradientTitle} className="mb-4">
            {title}
          </Heading>
          {subtitle && (
            <p className="text-lg text-[var(--c-text-muted)] leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
