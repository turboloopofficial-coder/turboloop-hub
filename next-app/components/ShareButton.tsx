"use client";

// ShareButton — universal share trigger. Renders a "Share" button that:
//   - On mobile (when navigator.share is available): opens the native
//     share sheet — best UX, lets users pick any installed app.
//   - Otherwise: opens a small modal with copy-link + Telegram + X +
//     WhatsApp + LinkedIn buttons.
//
// Every shared URL gets an hourly cache-bust appended (?s=<hour>) so
// Telegram/X/etc fetch fresh OG previews instead of caching the first
// share forever.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Share2,
  X,
  Check,
  Link as LinkIcon,
  Send as TelegramIcon,
  Twitter,
  MessageCircle,
  Linkedin,
  Mail,
} from "lucide-react";
import { showToast } from "./Toast";
import { haptic } from "@lib/haptic";

interface ShareButtonProps {
  /** Path on turboloop.tech to share, e.g. "/films/manifesto" */
  path: string;
  /** Pre-formatted message used in social share intents */
  message: string;
  /** Visual style */
  variant?: "primary" | "ghost" | "icon";
  /** Optional override for the visible label */
  label?: string;
  className?: string;
}

const SITE = "https://turboloop.tech";

function buildShareUrl(path: string): string {
  // Hourly cache-bust so social platforms refresh OG previews on each
  // new wave of shares. Same canonical (no ?s=) is in <head>, so SEO
  // is unaffected.
  const url = new URL(path, SITE);
  url.searchParams.set("s", String(Math.floor(Date.now() / 3600000)));
  return url.toString();
}

export function ShareButton({
  path,
  message,
  variant = "ghost",
  label = "Share",
  className = "",
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lock body scroll while modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onTrigger = () => {
    const url = buildShareUrl(path);
    // Mobile native share sheet — fastest path; lets users pick any app.
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      (navigator as any)
        .share({ title: "Turbo Loop", text: message, url })
        .catch((err: any) => {
          // AbortError = user dismissed — don't fall back to modal.
          if (err?.name === "AbortError") return;
          setOpen(true);
        });
    } else {
      setOpen(true);
    }
  };

  const copy = async () => {
    const url = buildShareUrl(path);
    const fullText = `${message}\n\n${url}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      haptic("success");
      showToast("Link copied", "success");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast("Couldn't copy — long-press the link", "error");
    }
  };

  const shareUrl = buildShareUrl(path);

  const platforms = [
    {
      key: "telegram",
      label: "Telegram",
      icon: TelegramIcon,
      color: "#229ED9",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`,
    },
    {
      key: "twitter",
      label: "X",
      icon: Twitter,
      color: "#0F172A",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message + "\n\n" + shareUrl + "\n\n#TurboLoop #DeFi")}`,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      color: "#25D366",
      url: `https://wa.me/?text=${encodeURIComponent(message + "\n\n" + shareUrl)}`,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: Linkedin,
      color: "#0A66C2",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      key: "email",
      label: "Email",
      icon: Mail,
      color: "#475569",
      url: `mailto:?subject=${encodeURIComponent("Turbo Loop")}&body=${encodeURIComponent(message + "\n\n" + shareUrl)}`,
    },
  ];

  const triggerClass =
    variant === "primary"
      ? "inline-flex items-center justify-center gap-2 px-4 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
      : variant === "icon"
        ? "inline-flex items-center justify-center w-11 h-11 rounded-full bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-md)] active:scale-95 transition"
        : "inline-flex items-center justify-center gap-2 px-4 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-md)] active:scale-[0.985] transition";

  // Modal — rendered through portal so transform/filter ancestors don't trap it.
  const modal = open && typeof document !== "undefined"
    ? createPortal(
        <div
          className="fixed inset-0 z-[var(--z-modal,70)] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full sm:max-w-sm rounded-t-[var(--r-2xl)] sm:rounded-[var(--r-2xl)] bg-[var(--c-surface)] shadow-[var(--s-xl)] overflow-hidden"
            onClick={e => e.stopPropagation()}
            style={{
              animation: "share-modal-in 280ms cubic-bezier(0.16, 1, 0.3, 1)",
              paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
            }}
          >
            <style>{`
              @keyframes share-modal-in {
                from { opacity: 0; transform: translateY(40px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-brand-cyan)]">
                  Share
                </div>
                <div className="text-base font-bold text-[var(--c-text)] mt-0.5">
                  Spread the word
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--c-text-muted)] hover:bg-[rgba(15,23,42,0.06)] active:scale-95 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Copy link — primary action */}
            <div className="px-5 pb-3">
              <button
                onClick={copy}
                className="w-full inline-flex items-center justify-center gap-2 px-4 h-12 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" /> Copy link
                  </>
                )}
              </button>
            </div>

            {/* Platform grid */}
            <div className="px-5 pb-5 grid grid-cols-3 gap-2">
              {platforms.map(p => (
                <a
                  key={p.key}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-2 p-3 rounded-[var(--r-md)] hover:bg-[rgba(15,23,42,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition active:scale-95"
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{
                      background: `${p.color}15`,
                      color: p.color,
                    }}
                  >
                    <p.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--c-text)]">
                    {p.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        onClick={onTrigger}
        className={`${triggerClass} ${className}`}
        aria-label="Share"
        type="button"
      >
        <Share2 className="w-4 h-4" />
        {variant !== "icon" && <span>{label}</span>}
      </button>
      {modal}
    </>
  );
}
