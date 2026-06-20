/**
 * NavProgressBar — thin top-of-screen progress bar shown during page navigation.
 *
 * How it works:
 * - Listens for the custom "navstart" event (dispatched by Navbar on every click)
 * - Immediately shows a bar that animates from 0% → 85% (indeterminate feel)
 * - Listens for route changes via useLocation() — when the route changes, the
 *   bar completes to 100% then fades out
 * - On very fast navigations (cached chunks) the whole thing takes ~200ms
 * - On slow navigations the bar stays at 85% until the chunk loads
 *
 * No external dependencies. Pure CSS animation.
 */
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

type BarState = "idle" | "loading" | "completing";

export default function NavProgressBar() {
  const [state, setState] = useState<BarState>("idle");
  const [width, setWidth] = useState(0);
  const [location] = useLocation();
  const prevLocation = useRef(location);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  // Listen for "navstart" — fired by Navbar immediately on every nav click
  useEffect(() => {
    const onNavStart = () => {
      clear();
      setWidth(0);
      setState("loading");
      // Ramp to 85% over ~600ms (feels indeterminate)
      rafRef.current = requestAnimationFrame(() => {
        setWidth(85);
      });
    };
    window.addEventListener("navstart", onNavStart);
    return () => window.removeEventListener("navstart", onNavStart);
  }, []);

  // When the route actually changes, complete the bar
  useEffect(() => {
    if (location === prevLocation.current) return;
    prevLocation.current = location;

    if (state === "loading" || state === "completing") {
      clear();
      setState("completing");
      setWidth(100);
      // After the bar reaches 100%, fade it out
      timerRef.current = setTimeout(() => {
        setState("idle");
        setWidth(0);
      }, 400);
    }
  }, [location, state]);

  if (state === "idle") return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[200] pointer-events-none"
      style={{ height: "3px" }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: "linear-gradient(90deg, #0891B2, #7C3AED, #9333EA)",
          boxShadow: "0 0 8px rgba(8,145,178,0.5), 0 0 16px rgba(124,58,237,0.3)",
          transition:
            state === "loading"
              ? "width 600ms cubic-bezier(0.1, 0.4, 0.3, 1)"
              : "width 200ms ease-out",
          opacity: state === "completing" && width === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
