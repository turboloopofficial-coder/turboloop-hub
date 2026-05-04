// Card — surface container with consistent radius, shadow, padding, and
// border. The legacy SPA had ~6 inline card definitions; this is the
// canonical one.
//
// Three elevation tiers map to the shadow scale: flat (no shadow, just
// border), raised (default — subtle lift), prominent (used for hero
// cards or modal-like surfaces).

import { cn } from "@lib/cn";
import type { HTMLAttributes } from "react";

type Elevation = "flat" | "raised" | "prominent";
type Padding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: Elevation;
  padding?: Padding;
  /** When true, card is interactive (cursor pointer, hover lifts).
   *  Use only when wrapping a card that genuinely is a clickable
   *  region — and prefer wrapping it in a real <button> or <a> for
   *  accessibility unless impossible. */
  interactive?: boolean;
  as?: "div" | "article" | "section";
}

const elevationClass: Record<Elevation, string> = {
  flat: "border border-[var(--c-border)]",
  raised: "border border-[var(--c-border)] shadow-[var(--s-md)]",
  prominent: "border border-[var(--c-border)] shadow-[var(--s-lg)]",
};

const paddingClass: Record<Padding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
};

export function Card({
  elevation = "raised",
  padding = "md",
  interactive,
  as: Tag = "div",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={cn(
        "bg-[var(--c-surface)] rounded-[var(--r-xl)]",
        elevationClass[elevation],
        paddingClass[padding],
        interactive && [
          "cursor-pointer transition-[transform,box-shadow]",
          "duration-[var(--m-quick)] ease-[var(--m-standard)]",
          "hover:-translate-y-0.5 hover:shadow-[var(--s-lg)]",
        ],
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
