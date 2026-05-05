"use client";

// ReadingProgress — slim brand-gradient bar pinned to the top of the
// page that fills as the user scrolls through the article. Visible
// signal of "how much is left to read." Common premium pattern from
// Medium / Stripe blog / Linear changelog.

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const max = doc.scrollHeight - doc.clientHeight;
      const next = max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0;
      setPct(next);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] z-[var(--z-nav,50)] pointer-events-none"
      style={{
        // Sit ABOVE the navbar's backdrop-blur so the bar is always
        // visible. The navbar has its own background; this strip sits
        // on top of it.
        background: "transparent",
      }}
      aria-hidden="true"
    >
      <div
        className="h-full transition-[width] duration-75 ease-linear"
        style={{
          width: `${pct}%`,
          background: "var(--c-brand-gradient)",
        }}
      />
    </div>
  );
}
