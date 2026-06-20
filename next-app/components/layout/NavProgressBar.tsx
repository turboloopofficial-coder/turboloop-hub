"use client";

/**
 * NavProgressBar — thin 3 px gradient bar at the very top of the screen.
 *
 * Fires on every internal navigation:
 *   - Listens for the custom "navstart" event dispatched by MobileMenu and
 *     ResourcesDropdown on every link click.
 *   - Also listens for Next.js router events via the "navigationstart" /
 *     "navigationend" approach (window events dispatched by NavLink helper).
 *   - Bar animates 0 → 85 % (indeterminate feel) then jumps to 100 % and
 *     fades out once the new page renders (detected via usePathname()).
 *
 * Zero external dependencies. Pure CSS transition.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type BarState = "idle" | "loading" | "completing";

export function NavProgressBar() {
  const [state, setState] = useState<BarState>("idle");
  const [width, setWidth] = useState(0);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  // Listen for "navstart" — dispatched by MobileMenu and ResourcesDropdown
  // on every link click so the bar starts on the same frame as the tap.
  useEffect(() => {
    const onNavStart = () => {
      clear();
      setWidth(0);
      setState("loading");
      // One rAF to let the 0% render, then animate to 85%
      rafRef.current = requestAnimationFrame(() => {
        setWidth(85);
      });
    };
    window.addEventListener("navstart", onNavStart);
    return () => window.removeEventListener("navstart", onNavStart);
  }, []);

  // Complete the bar when the pathname actually changes
  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    if (state === "loading" || state === "completing") {
      clear();
      setState("completing");
      setWidth(100);
      timerRef.current = setTimeout(() => {
        setState("idle");
        setWidth(0);
      }, 450);
    }
  }, [pathname, state]);

  if (state === "idle") return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 pointer-events-none"
      style={{ height: "3px", zIndex: 9999 }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background:
            "linear-gradient(90deg, #0891B2 0%, #7C3AED 60%, #9333EA 100%)",
          boxShadow:
            "0 0 8px rgba(8,145,178,0.6), 0 0 20px rgba(124,58,237,0.3)",
          transition:
            state === "loading"
              ? "width 600ms cubic-bezier(0.1, 0.4, 0.3, 1)"
              : "width 180ms ease-out, opacity 250ms ease-out",
          opacity: state === "completing" && width === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
