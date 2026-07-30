"use client";

// ExitIntentCapture — shows Telegram channel & group CTA when desktop users move to leave.
//
// Trigger: mouse leaves viewport from the top (exit intent signal).
// Only fires once per session. Only on desktop (>768px).
// Shows a lightweight modal with Telegram Channel + Group buttons.
// Fires GA4 event on show and on click.

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Zap, Users, Megaphone } from "lucide-react";

const SESSION_KEY = "turboloop_exit_intent_shown";

const TELEGRAM_CHANNEL = "https://t.me/TurboLoop_Official";
const TELEGRAM_GROUP = "https://t.me/TurboLoop_Chat";

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag(...args);
  }
}

export function ExitIntentCapture() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    // Desktop only
    if (window.innerWidth < 768) return;
    // Already shown this session
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {}

    // Wait at least 8 seconds before enabling exit intent
    const enableTimer = setTimeout(() => {
      const handleMouseLeave = (e: MouseEvent) => {
        if (firedRef.current) return;
        if (e.clientY <= 5) {
          firedRef.current = true;
          setOpen(true);
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {}
          gtag("event", "exit_intent_popup_shown", {
            page_path: window.location.pathname,
          });
          document.removeEventListener("mouseleave", handleMouseLeave);
        }
      };
      document.addEventListener("mouseleave", handleMouseLeave);
      return () => document.removeEventListener("mouseleave", handleMouseLeave);
    }, 8000);

    return () => clearTimeout(enableTimer);
  }, []);

  const handleClose = () => setOpen(false);

  const handleClick = (target: "channel" | "group") => {
    gtag("event", "exit_intent_telegram_click", {
      page_path: window.location.pathname,
      telegram_target: target,
    });
  };

  if (!mounted || !open) return null;

  return createPortal(
    <>
      <div
        onClick={handleClose}
        className="fixed inset-0 z-[110]"
        style={{
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          animation: "tl-exit-fade 200ms ease-out",
        }}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-title"
        className="fixed inset-0 z-[111] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <div
          onClick={e => e.stopPropagation()}
          className="relative rounded-2xl overflow-hidden"
          style={{
            width: "min(420px, calc(100vw - 2rem))",
            background: "var(--c-surface, #ffffff)",
            border: "1px solid var(--c-border, rgba(15,23,42,0.08))",
            boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
            animation: "tl-exit-pop 280ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Gradient bar */}
          <div className="h-1.5" style={{ background: "linear-gradient(90deg, #0088cc, #7C3AED)" }} />

          {/* Close */}
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-[rgba(15,23,42,0.06)] transition z-10"
          >
            <X className="w-5 h-5" style={{ color: "var(--c-text-muted)" }} />
          </button>

          <div className="px-6 py-7">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[#0088cc]" />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#0088cc" }}>
                Before you go
              </span>
            </div>
            <h3
              id="exit-title"
              className="text-lg font-bold mb-2"
              style={{ color: "var(--c-text, #0f172a)" }}
            >
              Join the TurboLoop Community
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--c-text-muted, #64748B)" }}>
              6,900+ investors get daily yield updates, market alerts, and exclusive strategies on Telegram.
            </p>

            <div className="flex flex-col gap-3">
              {/* Channel Button */}
              <a
                href={TELEGRAM_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleClick("channel")}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-white font-bold text-sm transition hover:opacity-90 hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #0088cc, #0066aa)" }}
              >
                <Megaphone className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <div>Join Channel</div>
                  <div className="text-[11px] font-normal opacity-80">Daily updates, alerts & strategies</div>
                </div>
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </a>

              {/* Group Button */}
              <a
                href={TELEGRAM_GROUP}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleClick("group")}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition hover:opacity-90 hover:scale-[1.02]"
                style={{
                  background: "var(--c-bg, #f1f5f9)",
                  color: "var(--c-text, #0f172a)",
                  border: "1px solid var(--c-border, rgba(15,23,42,0.1))",
                }}
              >
                <Users className="w-5 h-5 flex-shrink-0 text-[#7C3AED]" />
                <div className="flex-1">
                  <div>Join Community Group</div>
                  <div className="text-[11px] font-normal" style={{ color: "var(--c-text-muted, #64748B)" }}>
                    Chat with other investors & ask questions
                  </div>
                </div>
                <svg className="w-5 h-5 flex-shrink-0 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </a>
            </div>

            <p className="text-[11px] mt-4 text-center" style={{ color: "var(--c-text-muted, #94a3b8)" }}>
              Free forever. No spam. Real community.
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes tl-exit-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes tl-exit-pop {
          from { opacity: 0; transform: scale(0.94) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>,
    document.body
  );
}
