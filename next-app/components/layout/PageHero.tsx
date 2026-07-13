// PageHero — shared header block for all non-home marketing pages.
// Eyebrow + title + subtitle. Mobile-first. Server-renderable.
// Redesigned with floating orbs + hero-glow for premium feel.

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
    <section className="relative pt-14 pb-10 md:pt-24 md:pb-16 overflow-hidden">
      {/* Background layers — subtle glow + floating orbs */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 hero-glow opacity-60" />
        <div className="absolute top-[15%] left-[5%] w-48 h-48 rounded-full bg-cyan-500/8 blur-[60px] float-orb" />
        <div className="absolute bottom-[10%] right-[8%] w-40 h-40 rounded-full bg-purple-500/8 blur-[60px] float-orb" style={{ animationDelay: "-5s" }} />
      </div>
      <Container width="default">
        <div className="relative text-center max-w-2xl mx-auto">
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
            <p className="text-lg text-[var(--c-text-muted)] leading-relaxed max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
