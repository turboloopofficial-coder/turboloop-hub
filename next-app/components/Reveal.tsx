"use client";

// Reveal — wraps any block of content with a scroll-triggered fade-up
// animation. The block stays at opacity 0 + translateY(24px) until the
// IntersectionObserver fires, then transitions to opacity 1 + 0.
//
// Why custom (no framer-motion): keeps the bundle tiny and avoids
// hydration overhead on Server Components. We only need this one
// pattern, repeatedly, across ~12 sections.
//
// Honors prefers-reduced-motion (no animation, content visible from the
// start). SSR-safe: we render with `data-revealed="true"` until the
// effect mounts, so there's no flash-of-invisible-content for users
// without JS.

import { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  /** Stagger delay in ms — useful when multiple Reveal blocks animate
   *  in sequence (give each a slightly larger delay). */
  delayMs?: number;
  /** How early before the element enters the viewport (px). Negative
   *  values reveal earlier. */
  rootMargin?: string;
  className?: string;
}

export function Reveal({
  children,
  delayMs = 0,
  rootMargin = "-60px",
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Default to "shown" so SSR + no-JS renders content. Effect flips it to
  // "hidden until intersect" only after mount (and only if motion is OK).
  const [state, setState] = useState<"initial" | "hidden" | "shown">(
    "initial"
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Honor reduced motion — no animation, just show.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (reduced) {
      setState("shown");
      return;
    }

    setState("hidden");
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => setState("shown"), delayMs);
          obs.disconnect();
        }
      },
      { rootMargin, threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delayMs, rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: state === "hidden" ? 0 : 1,
        transform:
          state === "hidden" ? "translateY(24px)" : "translateY(0)",
        transition:
          state === "hidden"
            ? "none"
            : "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: state === "hidden" ? "opacity, transform" : "auto",
      }}
    >
      {children}
    </div>
  );
}
