// "Install TurboLoop" banner — surfaces the browser's PWA install gesture
// in a friendly, dismissible way.
//
// Behavior:
//   - Listens for the 'beforeinstallprompt' event (Chrome / Edge / Brave on
//     Android + desktop). Stashes it so we can fire it on user click.
//   - Only shows AFTER the user has visited 2+ routes — first-time landing
//     never gets nagged. (Tracks via localStorage page-view count.)
//   - Dismissed banners stay dismissed for 14 days (localStorage flag).
//   - Hidden when the app is already running standalone (means it's
//     installed) or on iOS Safari (different install flow — we surface
//     instructions instead).

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "turboloop_install_prompt_dismissed_at";
const VIEW_KEY = "turboloop_pageviews";
const MIN_VIEWS = 2;
const DISMISS_DAYS = 14;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
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

export default function InstallPrompt() {
  const [location] = useLocation();
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  // Increment page-view count on each route change.
  useEffect(() => {
    try {
      const n = Number(localStorage.getItem(VIEW_KEY) || 0) + 1;
      localStorage.setItem(VIEW_KEY, String(n));
    } catch {}
  }, [location]);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      // Don't show on the very first page-view; let the user explore first.
      try {
        const n = Number(localStorage.getItem(VIEW_KEY) || 0);
        if (n >= MIN_VIEWS) setShow(true);
      } catch {
        setShow(true);
      }
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setShow(false);
  };

  const install = async () => {
    if (!evt) return;
    try {
      await evt.prompt();
      await evt.userChoice;
    } catch {}
    setShow(false);
    setEvt(null);
  };

  if (!show || !evt) return null;

  return (
    <div
      role="dialog"
      aria-label="Install TurboLoop"
      className="fixed left-3 right-3 md:left-auto md:right-6 md:bottom-6 bottom-3 z-[60] mx-auto md:mx-0 max-w-sm rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
        boxShadow: "0 18px 50px -12px rgba(8,145,178,0.5)",
        animation: "fadeInUp 0.35s ease-out",
      }}
    >
      <div className="flex items-center gap-3 p-4 text-white">
        <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
          <Download className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm leading-tight">Install TurboLoop</div>
          <div className="text-xs text-white/80 mt-0.5">
            Open faster · works offline
          </div>
        </div>
        <button
          onClick={install}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-cyan-700 hover:bg-cyan-50 transition shrink-0"
        >
          Install
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
