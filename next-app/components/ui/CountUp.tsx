"use client";

// Animated number counter — eases from 0 to `target` over 1.5 s using
// easeOutExpo, triggered when the element first enters the viewport.
// Honors prefers-reduced-motion (renders the final value immediately).
//
// Lightweight by design: rAF loop + IntersectionObserver, no library.
//
// Usage:
//   <CountUp target={48} />          // → "48"
//   <CountUp target={6} suffix="+" />        // → "6+"
//   <CountUp target={100} prefix="$" suffix="K" />  // → "$100K"

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  target: number;
  /** Animation duration in ms — keeps the curve under 2 s so the user
   *  isn't waiting for the digit to settle. */
  durationMs?: number;
  /** Decimal places to render. Defaults to 0 (whole numbers). */
  decimals?: number;
  /** Optional prefix glued to the number (e.g. "$"). */
  prefix?: string;
  /** Optional suffix glued to the number (e.g. "+", "K"). */
  suffix?: string;
  className?: string;
}

// easeOutExpo from t in [0,1] — gives a "fast start, gentle settle"
// curve that reads as confident rather than boingy.
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function CountUp({
  target,
  durationMs = 1500,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState<number>(0);
  // After mount we show 0; after the IO fires we ramp to `target`. SSR
  // / no-JS users see `target` directly (the SSR render path renders
  // the formatted target via the early-return below).
  const [armed, setArmed] = useState<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      setArmed(true);
      return;
    }

    setArmed(true);
    setValue(0);

    let rafId = 0;
    let startTs = 0;
    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = Math.min(1, (ts - startTs) / durationMs);
      setValue(target * easeOutExpo(t));
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          rafId = requestAnimationFrame(tick);
          obs.disconnect();
        }
      },
      { rootMargin: "-40px", threshold: 0.1 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [target, durationMs]);

  // Pre-mount / SSR — render the final value so no-JS visitors see the
  // correct number and the layout never shifts when armed flips.
  const formatted = (armed ? value : target).toFixed(decimals);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
