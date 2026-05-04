// Container — defines the readable content width on a page.
// Three sizes match the layout tokens: narrow (640px) for prose,
// default (1080px) for marketing pages, wide (1280px) for hero blocks.
//
// Always horizontally centered, with mobile-first gutter that grows on
// desktop. Use this instead of an inline `max-w-* mx-auto px-4` everywhere.

import { cn } from "@lib/cn";

type Width = "narrow" | "default" | "wide" | "full";

interface ContainerProps {
  width?: Width;
  /** Removes the horizontal gutter — useful for full-bleed sections. */
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}

const widthClass: Record<Width, string> = {
  narrow: "max-w-[640px]", // reading column / blog body
  default: "max-w-[1080px]", // most pages
  wide: "max-w-[1280px]", // hero, full-bleed
  full: "max-w-none",
};

export function Container({
  width = "default",
  flush,
  className,
  children,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        widthClass[width],
        // Gutter that grows from 20px on phones to 32px on desktop.
        // Aligns with the design tokens (--gutter, see globals.css).
        !flush && "px-[var(--gutter)]",
        className
      )}
    >
      {children}
    </div>
  );
}
