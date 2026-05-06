"use client";

// Floating "back to top" button. Appears once the user has scrolled
// past 2× viewport height; smooth-scrolls to the top on click. Sized
// 44 px (touch-target compliant), brand gradient circle, mobile-aware
// positioning so it doesn't collide with the always-visible
// MobileBottomCTA bar at the bottom edge.
//
// Reduced-motion users get an instant scroll instead of the smooth
// behaviour. SSR-safe (window references are guarded inside effects).

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // 2× viewport feels right — far enough that the button isn't a
      // distraction during the first read, close enough to be useful
      // once the user is deep in a long page like /creatives or /blog.
      const threshold = window.innerHeight * 2;
      setVisible(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function jump() {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={jump}
      aria-label="Back to top"
      // Sit above the mobile bottom CTA bar (~76 px tall) on small
      // screens; standard bottom-right placement on desktop.
      className="fixed right-4 bottom-24 md:bottom-8 z-40 inline-flex items-center justify-center w-11 h-11 rounded-full bg-brand text-white shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition-[opacity,transform,box-shadow] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-brand-cyan)] focus-visible:ring-offset-2"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        // Pointer-events follow visibility so the invisible state
        // doesn't trap clicks meant for content underneath.
        pointerEvents: visible ? "auto" : "none",
        transitionDuration: "240ms",
        transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <ChevronUp className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}
