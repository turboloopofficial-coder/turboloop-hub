"use client";

// Homepage "Install App" widget. Surfaces the browser's PWA install
// gesture inside a regular homepage card.
//
// Important reality check: `beforeinstallprompt` is unreliable on
// Android Chrome without a controlling service worker, and never
// fires on iOS Safari at all. We deliberately keep the site
// SW-free (the /sw.js endpoint is the Phase 21 self-killer; adding
// a real SW would re-stick Brave users we just unblocked).
//
// So the strategy is: ALWAYS render platform-appropriate instructions
// when the site isn't running standalone. The native install button
// is a bonus when `beforeinstallprompt` fires; the instructions cover
// every other case. Real-world target: 90% mobile audience on Android
// Chrome / Trust Wallet browser / Brave / Samsung Internet, plus iOS.
//
// Behavior:
//   - Standalone mode (already installed) → widget hides itself
//   - iOS Safari → "Tap Share → Add to Home Screen" instructions
//   - Android (or other mobile) → "Tap menu (⋮) → Install app"
//     instructions, with the native button if beforeinstallprompt fires
//   - Desktop → instructions for pinning via the URL bar, plus the
//     native button if beforeinstallprompt fires
//   - Dismissed widget stays dismissed for 14 days (localStorage flag)
//
// Storage keys are namespaced with `tl_install_*` to avoid collisions
// with the legacy Vite SPA's `turboloop_install_*` keys (still live in
// the old admin SPA build at /admin).

import { useEffect, useState } from "react";
import { Download, X, Smartphone, Share2, MoreVertical, Monitor } from "lucide-react";
import { Container } from "@components/ui/Container";
import { haptic } from "@lib/haptic";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "tl_install_dismissed_at";
const DISMISS_DAYS = 14;

type Platform = "ios" | "android" | "desktop" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  // iPhone / iPad / iPod, including iPadOS 13+ which masquerades as Mac
  // when "Request Desktop Site" is implicit. The `ontouchend` check is
  // the canonical way to detect modern iPad-as-Mac.
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (ua.includes("Macintosh") && typeof document !== "undefined" && "ontouchend" in document) {
    return "ios";
  }
  // Android — covers Chrome, Samsung Internet, Brave, Trust Wallet's
  // in-app browser, Firefox Mobile. All show "Add to Home Screen" via
  // the menu, even when beforeinstallprompt doesn't fire automatically.
  if (/Android/i.test(ua)) return "android";
  // Desktop Chromium variants (Chrome / Edge / Brave / Opera) — these
  // can still install via the URL-bar install icon. Firefox + Safari
  // desktop don't support PWA install at all, but the card still adds
  // brand visibility — fall through to "desktop" for any non-mobile.
  if (/Windows|Linux|Macintosh|CrOS/i.test(ua)) return "desktop";
  return "other";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
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
  // Start hidden so the SSR'd HTML never contains the widget — it pops
  // in client-side after we've inspected the runtime environment.
  // Avoids hydration mismatch on first paint.
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [hidden, setHidden] = useState(true);
  // Per-platform steps panel is collapsed by default; user expands it
  // by tapping the "Show me how" button.
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) {
      setHidden(true);
      return;
    }
    const p = detectPlatform();
    setPlatform(p);
    setHidden(false);

    // Best-effort native prompt capture. On Android Chrome this MAY
    // fire after some engagement signal; when it does, we upgrade the
    // "instructions" UX to a one-tap native install button. On iOS
    // this event never fires; the instructions stay visible.
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // Some Android skin browsers fire `appinstalled` after manual
    // home-screen install — hide on that signal too.
    const onInstalled = () => setHidden(true);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    haptic("tap");
    setHidden(true);
  };

  const install = async () => {
    if (!evt) return;
    haptic("tap");
    try {
      await evt.prompt();
      const { outcome } = await evt.userChoice;
      if (outcome === "accepted") {
        haptic("success");
        setHidden(true);
      }
    } catch {}
    setEvt(null);
  };

  if (hidden || !platform) return null;

  // Per-platform copy + step list. The "primary" button label changes
  // to "Install app" when beforeinstallprompt has armed the native
  // prompt, otherwise "Show me how" to expand the manual steps.
  let icon = <Smartphone className="w-7 h-7 md:w-8 md:h-8" />;
  let eyebrow = "Pin it. One tap.";
  let heading = "Install TurboLoop on your phone";
  let subtitle =
    "Add the hub to your home screen — opens faster, no app store, no download. Same site, full-screen.";
  let steps: React.ReactNode = null;

  if (platform === "ios") {
    icon = <Share2 className="w-7 h-7 md:w-8 md:h-8" />;
    heading = "Install TurboLoop on your iPhone";
    subtitle =
      "Apple doesn't allow a one-tap install button on iOS — but adding TurboLoop to your home screen takes 3 quick taps via the Share menu.";
    steps = (
      <ol className="mt-4 space-y-2 text-sm text-white/95 list-decimal pl-5 leading-relaxed">
        <li>
          Tap the <strong>Share</strong> button at the bottom of Safari
          (the square with an arrow pointing up).
        </li>
        <li>
          Scroll down in the share sheet and tap{" "}
          <strong>Add to Home Screen</strong>.
        </li>
        <li>
          Tap <strong>Add</strong> in the top-right corner. The
          TurboLoop icon appears on your home screen.
        </li>
      </ol>
    );
  } else if (platform === "android") {
    icon = <MoreVertical className="w-7 h-7 md:w-8 md:h-8" />;
    heading = "Install TurboLoop on Android";
    subtitle =
      "Add TurboLoop to your home screen via your browser's menu. Two taps and it launches full-screen like a native app.";
    steps = (
      <ol className="mt-4 space-y-2 text-sm text-white/95 list-decimal pl-5 leading-relaxed">
        <li>
          Tap the <strong>menu</strong> button — usually three dots (
          <strong>⋮</strong>) at the top-right (Chrome, Brave, Edge) or
          bottom-right (Samsung Internet).
        </li>
        <li>
          Tap <strong>Install app</strong> or{" "}
          <strong>Add to Home screen</strong> in the menu.
        </li>
        <li>
          Confirm the install. TurboLoop appears on your home screen
          and launches full-screen, just like a native app.
        </li>
      </ol>
    );
  } else if (platform === "desktop") {
    icon = <Monitor className="w-7 h-7 md:w-8 md:h-8" />;
    eyebrow = "Pin it to your taskbar.";
    heading = "Install TurboLoop on desktop";
    subtitle =
      "Pin TurboLoop to your taskbar or dock. Opens in its own window — no browser chrome, instant launch.";
    steps = (
      <ol className="mt-4 space-y-2 text-sm text-white/95 list-decimal pl-5 leading-relaxed">
        <li>
          Look for the <strong>install icon</strong> at the right end
          of your address bar (a small monitor / plus icon in Chrome,
          Edge, Brave, or Opera).
        </li>
        <li>
          Click it, then click <strong>Install</strong> in the popup.
        </li>
        <li>
          TurboLoop opens in its own window. Pin it to your taskbar /
          dock for one-click launch.
        </li>
      </ol>
    );
  } else {
    // "other" — Firefox desktop, niche browsers. We still render the
    // card with a generic message because users in this bucket can
    // usually find an "Add bookmark to home screen" gesture somewhere
    // in their browser menu.
    icon = <Download className="w-7 h-7 md:w-8 md:h-8" />;
    heading = "Add TurboLoop to your home screen";
    subtitle =
      "Your browser may not support one-tap install, but you can usually find an \"Add to Home Screen\" or \"Pin to Start\" option in your browser menu.";
    steps = null;
  }

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
          {/* Decorative dot grid */}
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
                {icon}
              </div>

              <div className="flex-1 min-w-0 pr-8">
                <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-white/80 mb-1.5">
                  {eyebrow}
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold leading-tight">
                  {heading}
                </h2>
                <p className="text-sm md:text-base text-white/85 mt-2 leading-relaxed">
                  {subtitle}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {/* Native install button — only shown when the browser
                      armed `beforeinstallprompt`. Replaces the manual
                      "show me how" CTA in that case. */}
                  {evt && (
                    <button
                      onClick={install}
                      className="inline-flex items-center gap-2 px-5 h-12 rounded-[var(--r-md)] text-sm font-bold bg-white text-[var(--c-brand-cyan)] hover:bg-white/95 active:scale-[0.985] shadow-[var(--s-md)] transition"
                    >
                      <Download className="w-4 h-4" />
                      Install app
                    </button>
                  )}

                  {/* Manual instructions toggle — always available for
                      iOS / Android / desktop. On Android, this is the
                      primary CTA when beforeinstallprompt didn't fire
                      (which is the common case without a SW). */}
                  {steps && (
                    <button
                      onClick={() => setShowSteps(s => !s)}
                      aria-expanded={showSteps}
                      className={
                        evt
                          ? "inline-flex items-center gap-2 px-4 h-12 rounded-[var(--r-md)] text-sm font-bold text-white bg-white/15 hover:bg-white/25 active:scale-[0.985] transition"
                          : "inline-flex items-center gap-2 px-5 h-12 rounded-[var(--r-md)] text-sm font-bold bg-white text-[var(--c-brand-cyan)] hover:bg-white/95 active:scale-[0.985] shadow-[var(--s-md)] transition"
                      }
                    >
                      {showSteps ? "Hide steps" : "Show me how"}
                    </button>
                  )}
                </div>

                {showSteps && steps}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
