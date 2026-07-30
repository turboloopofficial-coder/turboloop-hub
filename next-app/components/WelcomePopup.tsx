"use client";

// WelcomePopup — scroll-based trigger for better UX.
//
// Trigger logic: shows when user scrolls 30% of the page OR after 15 seconds,
// whichever comes first. This ensures engaged users see it at the right moment
// instead of being interrupted immediately on load.
//
// Suppressed on /creatives (users already engaged with banner library).
// Sets sessionStorage flag on close so it never re-appears in the same session.

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Sparkles, X, ExternalLink } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";

const SESSION_KEY = "turboloop_welcome_seen";
const TITLE = "Welcome to TurboLoop";
const MESSAGE = [
  "Turbo Loop is the complete DeFi ecosystem on BNB Smart Chain — sustainable yield farming, a fiat-to-crypto gateway, decentralized swaps, and a 20-level referral network.",
  "Explore the hub to discover cinematic films, in-depth articles, daily community calls in 12+ languages, and ready-to-share creative assets.",
  "Whether you're new to DeFi or an experienced investor, the protocol is designed to be transparent, audited, renounced, and open to everyone.",
];

const SCROLL_THRESHOLD = 0.30; // 30% of page
const TIME_THRESHOLD = 15000;  // 15 seconds

export function WelcomePopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const triggerPopup = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    setMounted(true);
    // Suppress on creatives hub
    if (pathname?.startsWith("/creatives")) return;
    // Already seen this session
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {}

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let triggered = false;

    const handleTrigger = () => {
      if (triggered || cancelled) return;
      triggered = true;
      triggerPopup();
      // Clean up
      if (timer) clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };

    // Scroll-based trigger: fire when user scrolls 30% of page
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0 && scrollTop / docHeight >= SCROLL_THRESHOLD) {
        handleTrigger();
      }
    };

    // Time-based fallback: fire after 15 seconds regardless
    timer = setTimeout(handleTrigger, TIME_THRESHOLD);

    // Listen for scroll
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname, triggerPopup]);

  // Lock body scroll while open
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
  };

  if (!mounted || !open) return null;

  return createPortal(
    <>
      <div
        onClick={handleClose}
        className="fixed inset-0 z-[100]"
        style={{
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(4px)",
          animation: "tl-welcome-fade 200ms ease-out",
        }}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <div
          onClick={e => e.stopPropagation()}
          className="relative rounded-2xl overflow-hidden"
          style={{
            width: "min(420px, calc(100vw - 2rem))",
            maxHeight: "calc(100vh - 4rem)",
            background: "var(--c-surface, #ffffff)",
            border: "1px solid var(--c-border, rgba(15,23,42,0.08))",
            boxShadow: "0 25px 80px rgba(0,0,0,0.18), 0 8px 32px rgba(8,145,178,0.10)",
            animation: "tl-welcome-pop 280ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Top accent gradient bar */}
          <div
            className="h-1.5"
            style={{
              background:
                "linear-gradient(90deg, #0891B2, #7C3AED, #0891B2)",
            }}
          />

          {/* Close button */}
          <button
            onClick={handleClose}
            type="button"
            aria-label="Close welcome dialog"
            className="absolute top-2 right-2 inline-flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-full text-[var(--c-text-muted)] hover:bg-[rgba(15,23,42,0.06)] active:scale-95 transition z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Internal scroll wrapper */}
          <div
            className="px-6 py-7 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 4rem - 1.5rem)" }}
          >
            {/* Header pill */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(8,145,178,0.12), rgba(124,58,237,0.12))",
                  border: "1px solid rgba(8,145,178,0.18)",
                }}
              >
                <Sparkles className="w-5 h-5 text-[var(--c-brand-cyan)]" />
              </div>
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
                style={{
                  background: "rgba(8,145,178,0.10)",
                  color: "var(--c-brand-cyan)",
                  border: "1px solid rgba(8,145,178,0.15)",
                }}
              >
                Community Hub
              </span>
            </div>

            <h2
              id="welcome-title"
              className="text-xl md:text-2xl font-bold mb-4"
              style={{ color: "var(--c-text, #0f172a)" }}
            >
              {TITLE}
            </h2>

            <div
              className="text-sm leading-relaxed space-y-3 mb-6"
              style={{ color: "var(--c-text-muted, #64748B)" }}
            >
              {MESSAGE.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleClose}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 min-h-[44px] h-12 rounded-[var(--r-lg)] text-sm font-bold text-white shadow-[var(--s-brand)] active:scale-[0.985] transition"
                style={{ background: "var(--c-brand-gradient)" }}
              >
                Explore the Hub
              </button>
              <a
                href="https://turboloop.io"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 min-h-[44px] h-12 rounded-[var(--r-lg)] text-sm font-bold border active:scale-[0.985] transition"
                style={{
                  color: "var(--c-text, #0f172a)",
                  background: "var(--c-bg, #f7f8fc)",
                  borderColor:
                    "var(--c-border, rgba(15,23,42,0.08))",
                }}
              >
                Launch App
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes tl-welcome-fade {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes tl-welcome-pop {
            from { opacity: 0; transform: scale(0.94) translateY(20px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          @media (prefers-reduced-motion: reduce) {
            [role="dialog"] > *,
            [aria-hidden="true"] {
              animation: none !important;
            }
          }
        `}</style>
      </div>
    </>,
    document.body
  );
}
