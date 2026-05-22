"use client";

// Homepage "Install App" widget. Surfaces the browser's PWA install
// gesture inside a regular homepage card (NOT a floating banner) so it
// fits the existing section rhythm.
//
// We deliberately keep this manifest-only — no service worker
// registration. The /sw.js endpoint is currently a self-killer (Phase 21
// cache nuclear), and a real PWA SW would re-stick Brave users that we
// just unblocked. Manifest + HTTPS + icons is enough for Chrome / Edge /
// Brave on Android + desktop to qualify the site as installable; the
// `beforeinstallprompt` event fires regardless of SW presence on
// Chromium since the 2023 installability rules.
//
// Behavior:
//   - Standalone mode (already installed) → widget hides itself.
//   - Chromium with `beforeinstallprompt` available → "Install app"
//     button fires the native prompt.
//   - iOS Safari (no programmatic install) → shows the manual
//     Share-sheet → "Add to Home Screen" instructions inline.
//   - Anywhere else (Firefox desktop, etc.) → falls through to the iOS
//     instructions, which are also valid for "Add to Home Screen" /
//     "Pin to taskbar" gestures on those browsers.
//   - Dismissed widget stays dismissed for 14 days (localStorage flag).
//
// Storage keys are namespaced with `tl_install_*` to avoid collisions
// with the legacy Vite SPA's `turboloop_install_*` keys — those still
// live in the old admin SPA build at /admin.

import { useEffect, useState } from "react";
import { Download, X, Smartphone, Share2 } from "lucide-react";
import { Container } from "@components/ui/Container";
import { haptic } from "@lib/haptic";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "tl_install_dismissed_at";
const DISMISS_DAYS = 14;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  // iPhone / iPad / iPod, including iPadOS 13+ which masquerades as Mac.
  const ua = navigator.userAgent;
  return (
    /iPhone|iPad|iPod/.test(ua) ||
    (ua.includes("Macintosh") && "ontouchend" in document)
  );
}

function recentlyDismissed(): boolean {
  try {
    const ts = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (!ts) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function InstallAppWidget() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  // `mode` controls what we render. Starts as "hidden" so we never SSR
  // anything — the widget only mounts client-side after we've inspected
  // the runtime environment.
  const [mode, setMode] = useState<"hidden" | "prompt" | "ios">("hidden");
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    // Don't render if already installed, recently dismissed, or never
    // shown at all (SSR fallback).
    if (isStandalone() || recentlyDismissed()) {
      setMode("hidden");
      return;
    }

    if (isIos()) {
      // iOS Safari can install via the share sheet but never fires
      // beforeinstallprompt. Show the inline instructions card.
      setMode("ios");
      return;
    }

    // Chromium: wait for beforeinstallprompt. If it never fires (Firefox
    // desktop, etc.) the widget stays hidden — that's the right call,
    // those browsers don't have a native install gesture and an
    // instructions card would be wrong.
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      setMode("prompt");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // If we never get the event, just stay hidden. The fallback for
    // Firefox-desktop and the like is "you can pin from the address bar"
    // — we don't surface that as a card because it's noisy.
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    haptic("tap");
    setMode("hidden");
  };

  const install = async () => {
    if (!evt) return;
    haptic("tap");
    try {
      await evt.prompt();
      const { outcome } = await evt.userChoice;
      if (outcome === "accepted") {
        haptic("success");
      }
    } catch {}
    setMode("hidden");
    setEvt(null);
  };

  if (mode === "hidden") return null;

  return (
    <section className="py-12 md:py-16" aria-label="Install TurboLoop">
      <Container width="narrow">
        <div
          className="relative rounded-[var(--r-xl)] overflow-hidden shadow-[var(--s-xl)]"
          style={{
            background:
              "linear-gradient(135deg, var(--c-brand-cyan) 0%, var(--c-brand-purple, #7C3AED) 100%)",
          }}
        >
          {/* Decorative dot grid (purely visual) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
              backgroundSize: "16px 16px",
            }}
          />

          <button
            onClick={dismiss}
            aria-label="Dismiss install prompt"
            className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 transition flex items-center justify-center text-white z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative p-6 md:p-10 text-white">
            <div className="flex items-start gap-4 md:gap-6">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                {mode === "ios" ? (
                  <Smartphone className="w-7 h-7 md:w-8 md:h-8" />
                ) : (
                  <Download className="w-7 h-7 md:w-8 md:h-8" />
                )}
              </div>

              <div className="flex-1 min-w-0 pr-8">
                <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-white/80 mb-1.5">
                  Pin it. One tap.
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold leading-tight">
                  Install TurboLoop on your phone
                </h2>
                <p className="text-sm md:text-base text-white/85 mt-2 leading-relaxed">
                  Add the hub to your home screen — opens faster, no app
                  store, no download. Same site, full-screen.
                </p>

                {/* Chromium: native install button */}
                {mode === "prompt" && (
                  <button
                    onClick={install}
                    className="mt-5 inline-flex items-center gap-2 px-5 h-12 rounded-[var(--r-md)] text-sm font-bold bg-white text-[var(--c-brand-cyan)] hover:bg-white/95 active:scale-[0.985] shadow-[var(--s-md)] transition"
                  >
                    <Download className="w-4 h-4" />
                    Install app
                  </button>
                )}

                {/* iOS: inline manual instructions */}
                {mode === "ios" && (
                  <>
                    <button
                      onClick={() => setShowIosSteps(s => !s)}
                      aria-expanded={showIosSteps}
                      className="mt-5 inline-flex items-center gap-2 px-5 h-12 rounded-[var(--r-md)] text-sm font-bold bg-white text-[var(--c-brand-cyan)] hover:bg-white/95 active:scale-[0.985] shadow-[var(--s-md)] transition"
                    >
                      <Share2 className="w-4 h-4" />
                      {showIosSteps ? "Hide steps" : "Show me how"}
                    </button>
                    {showIosSteps && (
                      <ol className="mt-4 space-y-2 text-sm text-white/95 list-decimal pl-5">
                        <li>
                          Tap the <strong>Share</strong> button at the
                          bottom of your screen (the square with an
                          arrow pointing up).
                        </li>
                        <li>
                          Scroll down and tap{" "}
                          <strong>Add to Home Screen</strong>.
                        </li>
                        <li>
                          Tap <strong>Add</strong> in the top-right
                          corner.
                        </li>
                      </ol>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
