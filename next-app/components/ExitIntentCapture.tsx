"use client";

// ExitIntentCapture — captures email leads when desktop users move to leave.
//
// Trigger: mouse leaves viewport from the top (exit intent signal).
// Only fires once per session. Only on desktop (>768px).
// Shows a lightweight modal with email input + CTA.
// Stores email in localStorage for the newsletter system to pick up.
// Fires GA4 event on show and on submit.

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Zap, ArrowRight } from "lucide-react";

const SESSION_KEY = "turboloop_exit_intent_shown";
const STORAGE_KEY = "turboloop_exit_email";

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

export function ExitIntentCapture() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    // Store email
    try {
      localStorage.setItem(STORAGE_KEY, email);
    } catch {}
    // Fire GA4 event
    gtag("event", "exit_intent_email_captured", {
      page_path: window.location.pathname,
    });
    setSubmitted(true);
    setTimeout(() => setOpen(false), 2000);
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
            width: "min(400px, calc(100vw - 2rem))",
            background: "var(--c-surface, #ffffff)",
            border: "1px solid var(--c-border, rgba(15,23,42,0.08))",
            boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
            animation: "tl-exit-pop 280ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Gradient bar */}
          <div className="h-1.5" style={{ background: "linear-gradient(90deg, #7C3AED, #0891B2)" }} />

          {/* Close */}
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-[rgba(15,23,42,0.06)] transition z-10"
          >
            <X className="w-5 h-5" style={{ color: "var(--c-text-muted)" }} />
          </button>

          <div className="px-6 py-7">
            {!submitted ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-[var(--c-brand-cyan)]" />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--c-brand-cyan)" }}>
                    Before you go
                  </span>
                </div>
                <h3
                  id="exit-title"
                  className="text-lg font-bold mb-2"
                  style={{ color: "var(--c-text, #0f172a)" }}
                >
                  Get weekly DeFi yield insights
                </h3>
                <p className="text-sm mb-5" style={{ color: "var(--c-text-muted, #64748B)" }}>
                  Join 6,900+ investors getting market updates, new plan alerts, and exclusive strategies.
                </p>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-4 h-11 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[var(--c-brand-cyan)]"
                    style={{
                      background: "var(--c-bg, #f7f8fc)",
                      borderColor: "var(--c-border, rgba(15,23,42,0.08))",
                      color: "var(--c-text, #0f172a)",
                    }}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-4 h-11 rounded-lg text-sm font-bold text-white"
                    style={{ background: "var(--c-brand-gradient, linear-gradient(135deg, #0891B2, #7C3AED))" }}
                  >
                    Join <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-[11px] mt-3" style={{ color: "var(--c-text-muted, #94a3b8)" }}>
                  No spam. Unsubscribe anytime. We respect your inbox.
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-sm font-bold" style={{ color: "var(--c-text, #0f172a)" }}>
                  Welcome aboard! Check your inbox soon.
                </p>
              </div>
            )}
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
