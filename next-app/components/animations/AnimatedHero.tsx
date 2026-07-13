"use client";

/**
 * AnimatedHero — Client island for the homepage hero's animated elements.
 * Renders: ParticleField, OrbitalRing, TypewriterText, AnimatedCounter.
 * Kept as a single client boundary so the parent page stays a Server Component.
 */

import { ParticleField } from "./ParticleField";
import { OrbitalRing } from "./OrbitalRing";
import { TypewriterText } from "./TypewriterText";
import { AnimatedCounter } from "./AnimatedCounter";

interface AnimatedHeroProps {
  /** Typewriter phrases to cycle through */
  phrases: string[];
}

export function AnimatedHero({ phrases }: AnimatedHeroProps) {
  return (
    <>
      {/* Background particle constellation */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <ParticleField />
      </div>

      {/* 3D Orbital ring — desktop only */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <OrbitalRing />
      </div>
    </>
  );
}

export function HeroTypewriter({ phrases, className }: { phrases: string[]; className?: string }) {
  return <TypewriterText phrases={phrases} className={className} />;
}

export function HeroCounter({
  end,
  prefix,
  suffix,
  className,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  return <AnimatedCounter end={end} prefix={prefix} suffix={suffix} className={className} />;
}
