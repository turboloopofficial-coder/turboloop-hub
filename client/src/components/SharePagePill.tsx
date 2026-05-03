// "Share this page" floating widget — appears top-right on every page
// wrapped in PageShell. Three quick actions: copy link, share on Telegram,
// share on X. Designed to multiply organic share rate (more clicks = more
// surfaces shared = more inbound traffic).

import { useState, useEffect } from "react";
import { Link2, Send, Twitter, Check } from "lucide-react";

interface Props {
  /** Path of the current page (e.g. "/security") — passed by PageShell */
  path: string;
  /** Label shown in copy/share text — typically the page's hero heading */
  title: string;
}

const SITE = "https://turboloop.tech";

export default function SharePagePill({ path, title }: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const fullUrl = `${SITE}${path}`;
  const shareText = `${title} — TurboLoop`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = fullUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(shareText)}`;
  const xHref = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`;

  // Native Web Share API (great on mobile — opens the system sheet with all installed apps).
  // CRITICAL: distinguish AbortError (user dismissed the native sheet) from a real failure
  // (API unavailable). If we treat them the same, we open the custom popup right after the
  // user explicitly closed the native one — that's the "double share UI" bug.
  const nativeShare = async (): Promise<
    "shared" | "cancelled" | "unsupported"
  > => {
    if (typeof navigator === "undefined" || !(navigator as any).share)
      return "unsupported";
    try {
      await (navigator as any).share({ title, url: fullUrl, text: shareText });
      return "shared";
    } catch (err: any) {
      if (err?.name === "AbortError") return "cancelled";
      return "unsupported";
    }
  };

  // Close popover on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-share-pill]")) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div data-share-pill className="relative inline-flex items-center">
      {/* Trigger button */}
      <button
        onClick={async () => {
          // Try native share first. Only fall back to the custom popover when the
          // API is unavailable — never after a user cancel.
          const result = await nativeShare();
          if (result === "unsupported") setOpen(o => !o);
        }}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-bold transition-all"
        style={{
          background: "rgba(255,255,255,0.95)",
          color: "#0F172A",
          border: "1px solid rgba(15,23,42,0.08)",
          boxShadow: "0 4px 14px -4px rgba(15,23,42,0.08)",
        }}
        aria-label="Share this page"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>

      {/* Expanded options popover (only on desktop; mobile uses native share) */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden p-1.5 z-50"
          style={{
            background: "white",
            border: "1px solid rgba(15,23,42,0.08)",
            boxShadow: "0 16px 40px -10px rgba(15,23,42,0.18)",
          }}
        >
          <button
            onClick={() => {
              copy();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition text-left"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Link2 className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-900">
                {copied ? "Copied!" : "Copy link"}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {fullUrl.replace(/^https:\/\//, "")}
              </div>
            </div>
          </button>
          <a
            href={telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition"
          >
            <Send className="w-4 h-4 shrink-0" style={{ color: "#0088cc" }} />
            <div className="text-sm font-bold text-slate-900">
              Share on Telegram
            </div>
          </a>
          <a
            href={xHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition"
          >
            <Twitter className="w-4 h-4 text-slate-700 shrink-0" />
            <div className="text-sm font-bold text-slate-900">Share on X</div>
          </a>
        </div>
      )}
    </div>
  );
}
