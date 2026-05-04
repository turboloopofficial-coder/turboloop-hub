// Heading — the typography ladder. Five tiers: display, h1, h2, title,
// eyebrow. Using anything else is a smell.
//
// Each tier picks its own size, weight, line-height, and letter-spacing
// from the design tokens. Responsive sizing is built in via clamp().
//
// `as` prop lets you render any tag without changing the visual style —
// e.g., a card title might be a real <h3> for accessibility, but visually
// styled as a "title" tier.

import { cn } from "@lib/cn";
import type { ElementType, ReactNode } from "react";

type Tier = "display" | "h1" | "h2" | "title" | "eyebrow";

interface HeadingProps {
  tier?: Tier;
  as?: ElementType;
  /** Render with the brand gradient — use for hero "Loop", section
   *  titles you want to pop. Spend sparingly: gradient text loses
   *  weight if everything is gradient. */
  gradient?: boolean;
  className?: string;
  children: ReactNode;
}

const tierClass: Record<Tier, string> = {
  // clamp() values mirror the tokens. Mobile size first.
  display: [
    "font-extrabold leading-[1.05]",
    "text-[clamp(2.75rem,8vw,5rem)]",
    "tracking-[-0.04em]",
  ].join(" "),
  h1: [
    "font-bold leading-[1.1]",
    "text-[clamp(2rem,5vw,3rem)]",
    "tracking-[-0.025em]",
  ].join(" "),
  h2: [
    "font-bold leading-[1.15]",
    "text-[clamp(1.5rem,4vw,2rem)]",
    "tracking-[-0.02em]",
  ].join(" "),
  title: "font-semibold leading-snug text-lg tracking-[-0.005em]",
  eyebrow: [
    "font-bold leading-none uppercase",
    "text-[0.6875rem] tracking-[0.2em]",
  ].join(" "),
};

const tierDefaultElement: Record<Tier, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  title: "h3",
  eyebrow: "span",
};

export function Heading({
  tier = "h2",
  as,
  gradient,
  className,
  children,
}: HeadingProps) {
  const Tag = as || tierDefaultElement[tier];
  return (
    <Tag
      className={cn(
        tierClass[tier],
        gradient && "text-brand-wide",
        className
      )}
    >
      {children}
    </Tag>
  );
}
